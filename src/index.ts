type MessageNode = { [segment: string]: string[] };
type MessageWithFieldNode = {
  [segment: string]: {
    [field: string]: string | string[];
  };
};
export type FieldComponent = {
  [component: string]:
    | string
    | {
        [sub: string]: string;
      };
};

export type MessageWithFieldAndComponentNode = {
  [segment: string]: {
    [field: string]: string | FieldComponent[] | FieldComponent;
  };
};

export class HL7v2Message {
  private readonly fieldDelimiter: string;
  private readonly componentDelimiter: string;
  private readonly repeatingFieldDelimiter: string;
  private readonly escapeCharacter: string;
  private readonly subComponentDelimiter: string;
  private readonly MSH_SEGMENT: string;
  private readonly DATA_SEGMENTS: string[];

  private _message: MessageWithFieldAndComponentNode;
  private _raw: string;

  get message() {
    return this._message;
  }

  get raw() {
    return this._raw;
  }

  constructor(raw: string) {
    this._raw = raw;
    this._message = {};
    let segments = raw.split("\r");
    let MSH_SEGMENT = segments.shift();
    if (!MSH_SEGMENT) throw new Error("MSH Segment is Falsy");
    this.MSH_SEGMENT = MSH_SEGMENT;
    this.DATA_SEGMENTS = segments;
    this.fieldDelimiter = MSH_SEGMENT[3];
    this.componentDelimiter = MSH_SEGMENT[4];
    this.repeatingFieldDelimiter = MSH_SEGMENT[5];
    this.escapeCharacter = MSH_SEGMENT[6];
    this.subComponentDelimiter = MSH_SEGMENT[7];
    this.parse();
  }

  private parse() {
    const MSH_SEGMENT = this.parseMSH();
    const parsedSegments = this.parseSegments(this.DATA_SEGMENTS);
    //this.segmentsParsed = parsedSegments;
    const parsedRepeatedField = this.parseRepeatingFields(parsedSegments);
    //this.repeatedParsed = parsedRepeatedField;

    const parsedComponents = this.parseComponents(parsedRepeatedField);
    let parsedMessage: MessageWithFieldAndComponentNode = {
      MSH: MSH_SEGMENT["MSH"],
      ...parsedComponents,
    };
    this._message = parsedMessage;
    return this._message;
  }

  private parseMSH() {
    const segments = this.parseSegments([this.MSH_SEGMENT]);

    const parseRepeatedField = this.parseRepeatingFields(segments);

    let components = this.parseComponents(parseRepeatedField);
    let mshSegment: { MSH: { [field: number]: any } } = { MSH: {} };
    // re-write keys field because the parsing will be incorrect;
    for (let [key, field] of Object.entries(components["MSH"])) {
      let fieldKey = parseInt(key, 10);
      // the Encoding characters and Field separator don't map correctly with the parsing logic so we will
      // manually correct those;
      if (fieldKey < 2) continue;
      // increment key value by 1 since HL7 fields are 1-based
      mshSegment.MSH[fieldKey + 1] = field;
    }
    // set the first field in MSH to the field delimiter
    mshSegment.MSH[1] = this.fieldDelimiter;
    // this contains the escape characters
    mshSegment.MSH[2] = this.MSH_SEGMENT.substring(4, 8);
    return mshSegment;
  }

  private replaceEscape(str: string): string {
    return str
      .replace("\\F", "|")
      .replace("\\R", "~")
      .replace("\\S", "^")
      .replace("\\T", "&")
      .replace("\\E", "\\");
  }

  /**
   *
   * @param segments Array of Segments
   * @returns an object with headers as keys and values of fields
   */
  private parseSegments(segments: string[]): MessageNode {
    let obj: MessageNode = {};
    for (let ind in segments) {
      let segment = segments[ind];
      let fields = segment
        .split(this.fieldDelimiter)
        // remove any line feed
        .map((v) => v.replace(/\n/, ""));
      let header = fields.shift();
      if (!header) throw new Error("No Header");
      // some segments can appear multiple times so we append the Sequence Field
      // PV1.1 when parsing into a JSON object
      switch (header) {
        case "AIG":
        case "AIL":
        case "AIP":
        case "AIS":
        case "AL1":
        case "CM0":
        case "CM1":
        case "CM2":
        case "DB1":
        case "DG1":
        case "DSP":
        case "FT1":
        case "GT1":
        case "IN1":
        case "IN3":
        case "NK1":
        case "NTE":
        case "OBR":
        case "OBX":
        case "PID":
        case "PR1":
        case "PV1":
        case "RGS":
        case "RQD":
        case "TXA":
        case "UB1":
        case "UB2":
          // set based on sequence field or if omitted set to 1;
          header = `${header}.${fields[0] ?? "1"}`;
          break;
        default:
          break;
      }
      // in the event the header already already exists will append [index] 1-based
      if (obj[header]) {
        let incrementingHeader = header;
        let index = 1;
        while (true) {
          incrementingHeader = `${header}[${index}]`;

          if (
            !Object.entries(obj)
              .map((v) => v[0])
              .includes(incrementingHeader)
          )
            break;
          index = index + 1;
        }
        header = incrementingHeader;
      }
      obj[header] = fields;
      continue;
    }
    return obj;
  }

  /**
   * Parses over messages that have repeating fields and
   * @param messageNode The message node to parse over it's keys
   * @returns
   */
  private parseRepeatingFields(messageNode: MessageNode): MessageWithFieldNode {
    let obj: MessageWithFieldNode = {};
    fields: for (let [segment, fields] of Object.entries(messageNode)) {
      field: for (let fieldInd in fields) {
        let fieldIndex = parseInt(fieldInd, 10) + 1;
        let field = fields[fieldInd];
        if (!obj[segment]) {
          obj[segment] = {};
        }
        let repeatedFields = field.split(this.repeatingFieldDelimiter);
        if (repeatedFields.length <= 1) {
          // No repeating fields
          obj[segment][fieldIndex] = repeatedFields[0];
          continue;
        }

        obj[segment][fieldIndex] = repeatedFields;
      }
    }
    return obj;
  }

  parseComponents(
    fieldNode: MessageWithFieldNode
  ): MessageWithFieldAndComponentNode {
    let componentNode: MessageWithFieldAndComponentNode = {};
    // * iterate through the segments
    segment: for (let [segment, fields] of Object.entries(fieldNode)) {
      this.initializeComponentNodeSegment(componentNode, segment);
      // * iterate through the fields
      fields: for (let [outerInd, field] of Object.entries(fields)) {
        if (typeof field !== "string") {
          // * field is an array, which should be a repeated field
          repeat: for (let [_ind, repeat] of Object.entries(field)) {
            let components = repeat.split(this.componentDelimiter);
            if (!Array.isArray(componentNode[segment][outerInd]))
              componentNode[segment][outerInd] = [];
            this.initializeFieldObject(componentNode, segment, outerInd);
            if (components.length <= 1) {
              // There is only 1 item so we create the string and index the property based on the repeated field
              (
                componentNode[segment][outerInd] as (FieldComponent | string)[]
              ).push(this.replaceEscape(components[0]));
              continue;
            }
            let componentObject = this.toComplexComponentObject(components);

            (componentNode[segment][outerInd] as FieldComponent[]).push(
              componentObject
            );

            continue;
          }
          continue fields;
        }

        // field is a string
        let components = field.split(this.componentDelimiter);
        this.initializeFieldObject(componentNode, segment, outerInd);

        if (components.length <= 1) {
          componentNode[segment][outerInd] = this.replaceEscape(components[0]);
          continue;
        }
        let componentObject = this.toComplexComponentObject(components);
        componentNode[segment][outerInd] = componentObject;
      }
    }
    return componentNode;
  }

  private initializeFieldObject(
    componentNode: MessageWithFieldAndComponentNode,
    segment: string,
    outerInd: string
  ) {
    if (!componentNode[segment][outerInd]) {
      componentNode[segment][outerInd] = {};
    }
  }

  private toComplexComponentObject(components: string[]) {
    let componentObject: any = {};
    components: for (let compInd in components) {
      let index = parseInt(compInd, 10) + 1;
      let component = components[compInd];
      let subComponents = component.split(this.subComponentDelimiter);
      if (subComponents.length <= 1) {
        componentObject[index] = this.replaceEscape(subComponents[0]);
        continue components;
      }

      subComponents: for (let subInd in subComponents) {
        let subComponent = subComponents[subInd];
        let subIndex = parseInt(subInd, 10) + 1;
        if (!componentObject[index]) componentObject[index] = {};
        componentObject[index][subIndex] = this.replaceEscape(subComponent);
        continue subComponents;
      }
    }
    return componentObject;
  }

  private initializeComponentNodeSegment(
    componentNode: MessageWithFieldAndComponentNode,
    segment: string
  ) {
    if (!componentNode[segment]) {
      componentNode[segment] = {};
    }
  }
}

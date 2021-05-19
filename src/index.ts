import jp from "jsonpath";

type MessageNode = { [segment: string]: string[] };
type MessageWithFieldNode = {
  [segment: string]: {
    [field: string]: string | { [repeatedFieldInd: string]: string };
  };
};
type MessageWithFieldAndComponentNode = {
  [segment: string]: {
    [field: string]:
      | string
      | {
          [repeatedFieldInd: string]:
            | string
            | {
                [component: string]:
                  | string
                  | string[]
                  | { [sub: string]: string };
              };
        }
      | { [component: string]: string | string[] | { [sub: string]: string } };
  };
};

export class HL7v2Message {
  readonly raw: string;
  readonly fieldDelimiter: string;
  readonly componentDelimiter: string;
  readonly repeatingFieldDelimiter: string;
  readonly escapeCharacter: string;
  readonly subComponentDelimiter: string;

  message: MessageWithFieldAndComponentNode;

  readonly MSH_SEGMENT: string;
  readonly DATA_SEGMENTS: string[];

  constructor(raw: string) {
    this.raw = raw;
    this.message = {};
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

  get(path: string) {
    return jp.query(this.message, path);
  }

  parse() {
    const MSH_SEGMENT = this.parseMSH();
    const parsedSegments = this.parseSegments(this.DATA_SEGMENTS);
    //this.segmentsParsed = parsedSegments;
    const parsedRepeatedField = this.parseRepeatingFields(parsedSegments);
    //this.repeatedParsed = parsedRepeatedField;
    let parsedMessage: MessageWithFieldAndComponentNode = {
      MSH: MSH_SEGMENT["MSH"],
    };
    const parsedComponents = this.parseComponents(parsedRepeatedField);

    this.message = { ...parsedMessage, ...parsedComponents };
    return this.message;
  }

  private parseMSH() {
    const segments = this.parseSegments([this.MSH_SEGMENT]);
    const parseRepeatedField = this.parseRepeatingFields(segments);
    let components = this.parseComponents(parseRepeatedField);
    // re-write this field because the parsing will be incorrect;
    components["MSH"][0] = this.MSH_SEGMENT.substring(3, 8);
    return components;
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
   *
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
        let repeatedObject: { [ind: string]: string } = {};
        for (let repeatInd in repeatedFields) {
          let index = parseInt(repeatInd, 10) + 1;
          let fieldValue = repeatedFields[repeatInd];

          repeatedObject[index] = fieldValue;
        }

        obj[segment][fieldIndex] = repeatedObject;
      }
    }
    return obj;
  }

  parseComponents(
    fieldNode: MessageWithFieldNode
  ): MessageWithFieldAndComponentNode {
    let componentNode: MessageWithFieldAndComponentNode = {};
    // iterate through the segments
    segment: for (let [segment, fields] of Object.entries(fieldNode)) {
      this.initializeComponentNodeSegment(componentNode, segment);
      if (typeof fields === "string") {
        componentNode[segment] = fields;
        continue;
      }
      fields: for (let [outerInd, field] of Object.entries(fields)) {
        if (typeof field !== "string") {
          repeat: for (let [ind, repeat] of Object.entries(field)) {
            let components = repeat.split(this.componentDelimiter);
            this.initializeFieldObject(componentNode, segment, outerInd);
            if (components.length <= 1) {
              if (ind) {
                // @ts-ignore
                componentNode[segment][outerInd][ind] = this.replaceEscape(
                  components[0]
                );
                continue;
              }
              componentNode[segment][outerInd] = this.replaceEscape(
                components[0]
              );

              continue;
            }
            let componentObject = this.toComplexComponentObject(components);

            if (ind) {
              // @ts-ignore
              componentNode[segment][outerInd][ind] = componentObject;
              continue;
            }
            componentNode[segment][outerInd] = componentObject;
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

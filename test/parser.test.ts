import "mocha";
import chai, { expect } from "chai";
import { HL7v2Message, FieldComponent } from "../src";
chai.should();

describe("Parse HL7 Message", () => {
  it("Should Parse HL7 Message Entirely", () => {
    let rawHL7v2 = `MSH|^~\\&|NextGen Rosetta|NextGen Clinic^0001|Billing System|Billing System|20210512143447231||ORU^R01|396213227|P|2.5\rEVN||20210512143447\rPID|1|215061|000001039267^^^North East Medical Services^MR|c50b528c-8d49-407f-884a-743cdc319a66~1204|TEST^DD||20110208|M||^Asian|INVALID^^INVALID^CA^99999^USA||^PRN^PH^^^111^1111111~^NET^Internet^offered||^Cantonese|S|^A|||||^Not Hispanic or Latino||||||||N\rPV1|1|O|1d433814-7fc9-418e-a2da-76fe075540ba||||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med|E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med||||||||||||||||||||||||||||||||||||201909111633||||||6561556\rORC||PRO6987293|1909110630||F||^^^^^R||20190911163524|873^Chew, EHR^Larry||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med\rOBR|1|PRO6987293|1909110630|CBC_AUTO^CBC W/AUTO DIFF|||20190911163627||||N|||||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med|||||||||F||^^^^^R\rOBX|1|ST|30000000^WBC||5.0|K/uL|4.5-13.5||||F|||20190911163627|CP\rOBX|2|ST|30000100^RBC||5.00|M/uL|4.30-5.90||||F|||20190911163627|CP\rOBX|3|ST|HGB^HGB||12.0|g/dL|11.5-14.5||||F|||20190911163627|CP\rOBX|4|ST|HCT^HEMATOCRIT||42.0|%|34.0-43.0||||F|||20190911163627|CP\rOBX|5|ST|30000400^MCV||88.0|fl|80.0-100.0||||F|||20190911163627|CP\rOBX|6|ST|30000500^Mean Cell Hemoglobin||28.0|pg|27.0-31.0||||F|||20190911163627|CP\rOBX|7|ST|30000600^MCHC||33.0|%|32.0-36.0||||F|||20190911163627|CP\rOBX|8|ST|30000700^RDW||13.0|Index|11.5-15.5||||F|||20190911163627|CP\rOBX|9|ST|PLT^PLATELET COUNT||258|Thousand/uL|140-400||||F|||20190911163627|CP\rOBX|10|ST|30004600^MPV||7.5|fl|7.4-10.4||||F|||20190911163627|CP\rOBX|11|ST|^# NEUTROPHIL||1.9|K/uL|1.8-7.7||||F|||20190911163627|CP\rOBX|12|ST|30002110^# LYMPHOCYTE||3.0|K/uL|1.0-4.8||||F|||20190911163627|CP\rOBX|13|ST|30002400^# MONOCYTE||1.0|K/uL|0.0-1.1||||F|||20190911163627|CP\rOBX|14|ST|30002700^# EOSINOPHIL||0.2|K/uL|0.0-0.5||||F|||20190911163627|CP\rOBX|15|ST|30003000^# BASOPHIL||0.2|K/uL|0.0-0.2||||F|||20190911163627|CP\rOBX|16|ST|30000900^% NEUTROPHIL||40.0|%|40.0-70.0||||F|||20190911163627|CP\rOBX|17|ST|30001800^% LYMPHOCYTE||23.0|%|22.0-44.0||||F|||20190911163627|CP\rOBX|18|ST|30002200^% MONOCYTE||10.0|%|0.0-10.0||||F|||20190911163627|CP\rOBX|19|ST|^% EOSINOPHIL||5.0|%|0.0-5.0||||F|||20190911163627|CP\rOBX|20|ST|30002800^% BASOPHIL||2.0|%|0.0-2.0||||F|||20190911163627|CP`;
    let msg = new HL7v2Message(rawHL7v2);

    msg.message["MSH"][2].should.equal("^~\\&");
    (msg.message["MSH"][9] as FieldComponent)[1].should.equal("ORU");
    (msg.message["MSH"][4] as FieldComponent)[1].should.equal("NextGen Clinic");
    msg.raw.should.equal(rawHL7v2);
    return (msg.message["OBX.2"]["2"] as FieldComponent)["0"].should.exist;
  });
});
describe("Repeating Segments that Don't Have Sequence Fields", () => {
  it("Should Parse HL7 Message Entirely", () => {
    let rawHL7v2 = `MSH|^~\\&|NextGen Rosetta|NextGen Clinic^0001|Billing System|Billing System|20210512143447231||ORU^R01|396213227|P|2.5\rEVN||20210512143447\rEVN||20210512143447\rEVN||20210512143447`;
    let msg = new HL7v2Message(rawHL7v2);
    msg.message["EVN[1]"].should.exist;
    msg.message["EVN[2]"].should.exist;
  });
});
describe("Sub components in components", () => {
  it("Should Parse HL7 Message Entirely", () => {
    let rawHL7v2 = `MSH|^~\\&|NextGen Rosetta|NextGen Clinic^0001|Billing System|Billing System|20210512143447231||ORU^R01|396213227|P|2.5\rEVN||20210512143447\rPID|1|215061|000001039267^^^North East Medical Services^MR&&N|c50b528c-8d49-407f-884a-743cdc319a66~1204|TEST^DD||20110208|M||^Asian|INVALID^^INVALID^CA^99999^USA||^PRN^PH^^^111^1111111~^NET^Internet^offered||^Cantonese|S|^A|||||^Not Hispanic or Latino||||||||N\rPV1|1|O|1d433814-7fc9-418e-a2da-76fe075540ba||||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med|E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med||||||||||||||||||||||||||||||||||||201909111633||||||6561556`;
    let msg = new HL7v2Message(rawHL7v2) as any;

    msg.message["PID.1"][3][5][3].should.equal("N");
  });
});

describe("Segment Sequencing", () => {
  it("Building Sequences Based on Sequence Id field", () => {
    let rawHL7v2 =
      "MSH|^~\\&|NextGen Rosetta|NextGen Clinic^0001|Billing System|Billing System|20210512143447231||ORU^R01|396213227|P|2.5\rAIG|1\rAIL|1\rAIP|1\rAIS|1\rAL1|1\rCM0|1\rCM1|1\rCM2|1\rDB1|1\rDG1|1\rDSP|1\rFT1|1\rGT1|1\rIN1|1\rIN3|1\rNK1|1\rNTE|1\rOBR|1\rOBX|1\rPID|1\rPR1|1\rPV1|1\rRGS|1\rRQD|1\rTXA|1\rUB1|1\rUB2|1";
    let v2 = new HL7v2Message(rawHL7v2);
    v2.message["AIG.1"].should.exist;
    v2.message["AIL.1"].should.exist;
    v2.message["AIP.1"].should.exist;
    v2.message["AIS.1"].should.exist;
    v2.message["AL1.1"].should.exist;
    v2.message["CM0.1"].should.exist;
    v2.message["CM1.1"].should.exist;
    v2.message["CM2.1"].should.exist;
    v2.message["DB1.1"].should.exist;
    v2.message["DG1.1"].should.exist;
    v2.message["DSP.1"].should.exist;
    v2.message["FT1.1"].should.exist;
    v2.message["GT1.1"].should.exist;
    v2.message["IN1.1"].should.exist;
    v2.message["IN3.1"].should.exist;
    v2.message["NK1.1"].should.exist;
    v2.message["NTE.1"].should.exist;
    v2.message["OBR.1"].should.exist;
    v2.message["OBX.1"].should.exist;
    v2.message["PID.1"].should.exist;
    v2.message["PR1.1"].should.exist;
    v2.message["PV1.1"].should.exist;
    v2.message["RGS.1"].should.exist;
    v2.message["RQD.1"].should.exist;
    v2.message["TXA.1"].should.exist;
    v2.message["UB1.1"].should.exist;
    v2.message["UB2.1"].should.exist;
  });

  it("Building Sequences Based on Empty Sequence Id field", () => {
    let rawHL7v2 =
      "MSH|^~\\&|NextGen Rosetta|NextGen Clinic^0001|Billing System|Billing System|20210512143447231||ORU^R01|396213227|P|2.5\rAIL||SOMETHING\rAIP||SOMETHING\rAIS||SOMETHING\rAL1||SOMETHING\rCM0||SOMETHING\rCM1||SOMETHING\rCM2||SOMETHING\rDB1||SOMETHING\rDG1||SOMETHING\rDSP||SOMETHING\rFT1||SOMETHING\rGT1||SOMETHING\rIN1||SOMETHING\rIN3||SOMETHING\rNK1||SOMETHING\rNTE||SOMETHING\rOBR||SOMETHING\rOBX||SOMETHING\rPID||SOMETHING\rPR1||SOMETHING\rPV1||SOMETHING\rRGS||SOMETHING\rRQD||SOMETHING\rTXA||SOMETHING\rUB1||SOMETHING\rUB2||SOMETHING";
    let v2 = new HL7v2Message(rawHL7v2);
    v2.message["AIL.1"].should.exist;
    v2.message["AIP.1"].should.exist;
    v2.message["AIS.1"].should.exist;
    v2.message["AL1.1"].should.exist;
    v2.message["CM0.1"].should.exist;
    v2.message["CM1.1"].should.exist;
    v2.message["CM2.1"].should.exist;
    v2.message["DB1.1"].should.exist;
    v2.message["DG1.1"].should.exist;
    v2.message["DSP.1"].should.exist;
    v2.message["FT1.1"].should.exist;
    v2.message["GT1.1"].should.exist;
    v2.message["IN1.1"].should.exist;
    v2.message["IN3.1"].should.exist;
    v2.message["NK1.1"].should.exist;
    v2.message["NTE.1"].should.exist;
    v2.message["OBR.1"].should.exist;
    v2.message["OBX.1"].should.exist;
    v2.message["PID.1"].should.exist;
    v2.message["PR1.1"].should.exist;
    v2.message["PV1.1"].should.exist;
    v2.message["RGS.1"].should.exist;
    v2.message["RQD.1"].should.exist;
    v2.message["TXA.1"].should.exist;
    v2.message["UB1.1"].should.exist;
    v2.message["UB2.1"].should.exist;
  });
});

describe("Errors", () => {
  it("Empty", () => {
    let rawHL7v2 = "";
    expect(() => new HL7v2Message(rawHL7v2)).to.throw("MSH Segment is Empty");
  });
  it("Bad MSH Segment", () => {
    let rawHL7v2 = "PID|8|250|add8925";
    expect(() => new HL7v2Message(rawHL7v2)).to.throw(
      "Invalid MSH Segment - Ensure that the first segment is a MSH Segment"
    );
  });
  it("Empty Segment Header", () => {
    let rawHL7v2 =
      "MSH|^~\\&|NextGen Rosetta|NextGen Clinic^0001|Billing System|Billing System|20210512143447231||ORU^R01|396213227|P|2.5\r|03593250290";
    expect(() => new HL7v2Message(rawHL7v2)).to.throw("Empty Segment Header");
  });
});

import "mocha";
import chai, { expect } from "chai";
import { HL7v2Message } from "../src";
chai.should();

// describe("Parse Out Segments", () => {
//   it("Should parse each segment into a property each repeated segment will be indexed OBR[1], ORB[2], ORB[2], and so on", () => {
//     let rawHL7v2 = `MSH|^~\\&|NextGen Rosetta|NextGen Clinic^0001|Billing System|Billing System|20210512143447231||ORU^R01|396213227|P|2.5\rEVN||20210512143447\rPID|1|215061|000001039267^^^North East Medical Services^MR|c50b528c-8d49-407f-884a-743cdc319a66|TEST^DD||20110208|M||^Asian|INVALID^^INVALID^CA^99999^USA||^PRN^PH^^^111^1111111~^NET^Internet^offered||^Cantonese|S|^A|||||^Not Hispanic or Latino||||||||N\rPV1|1|O|1d433814-7fc9-418e-a2da-76fe075540ba||||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med|E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med||||||||||||||||||||||||||||||||||||201909111633||||||6561556\rORC||PRO6987293|1909110630||F||^^^^^R||20190911163524|873^Chew, EHR^Larry||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med\rOBR|1|PRO6987293|1909110630|CBC_AUTO^CBC W/AUTO DIFF|||20190911163627||||N|||||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med|||||||||F||^^^^^R\rOBX|1|ST|30000000^WBC||5.0|K/uL|4.5-13.5||||F|||20190911163627|CP\rOBX|2|ST|30000100^RBC||5.00|M/uL|4.30-5.90||||F|||20190911163627|CP\rOBX|3|ST|HGB^HGB||12.0|g/dL|11.5-14.5||||F|||20190911163627|CP\rOBX|4|ST|HCT^HEMATOCRIT||42.0|%|34.0-43.0||||F|||20190911163627|CP\rOBX|5|ST|30000400^MCV||88.0|fl|80.0-100.0||||F|||20190911163627|CP\rOBX|6|ST|30000500^Mean Cell Hemoglobin||28.0|pg|27.0-31.0||||F|||20190911163627|CP\rOBX|7|ST|30000600^MCHC||33.0|%|32.0-36.0||||F|||20190911163627|CP\rOBX|8|ST|30000700^RDW||13.0|Index|11.5-15.5||||F|||20190911163627|CP\rOBX|9|ST|PLT^PLATELET COUNT||258|Thousand/uL|140-400||||F|||20190911163627|CP\rOBX|10|ST|30004600^MPV||7.5|fl|7.4-10.4||||F|||20190911163627|CP\rOBX|11|ST|^# NEUTROPHIL||1.9|K/uL|1.8-7.7||||F|||20190911163627|CP\rOBX|12|ST|30002110^# LYMPHOCYTE||3.0|K/uL|1.0-4.8||||F|||20190911163627|CP\rOBX|13|ST|30002400^# MONOCYTE||1.0|K/uL|0.0-1.1||||F|||20190911163627|CP\rOBX|14|ST|30002700^# EOSINOPHIL||0.2|K/uL|0.0-0.5||||F|||20190911163627|CP\rOBX|15|ST|30003000^# BASOPHIL||0.2|K/uL|0.0-0.2||||F|||20190911163627|CP\rOBX|16|ST|30000900^% NEUTROPHIL||40.0|%|40.0-70.0||||F|||20190911163627|CP\rOBX|17|ST|30001800^% LYMPHOCYTE||23.0|%|22.0-44.0||||F|||20190911163627|CP\rOBX|18|ST|30002200^% MONOCYTE||10.0|%|0.0-10.0||||F|||20190911163627|CP\rOBX|19|ST|^% EOSINOPHIL||5.0|%|0.0-5.0||||F|||20190911163627|CP\rOBX|20|ST|30002800^% BASOPHIL||2.0|%|0.0-2.0||||F|||20190911163627|CP`;
//     let msg = parseSegments(rawHL7v2);
//     msg.should.have.length(26);
//   });
// });

// describe("Parse Fields", () => {
//   it("Parse Fields into their own elements", () => {
//     let segment =
//       "OBX|19|ST|^% EOSINOPHIL \\F||5.0|%|0.0-5.0||||F|||20190911163627|CP";
//     let fieldData = parseFields(segment);
//     expect(fieldData[0] + "." + fieldData[1]).to.equal("OBX.19");
//     let expectedFieldData = [
//       "OBX",
//       "19",
//       "ST",
//       "^% EOSINOPHIL \\F",
//       "",
//       "5.0",
//       "%",
//       "0.0-5.0",
//       "",
//       "",
//       "",
//       "F",
//       "",
//       "",
//       "20190911163627",
//       "CP",
//     ];

//     JSON.stringify(fieldData).should.equal(JSON.stringify(expectedFieldData));
//   });
// });

// describe("Parse Repeating Fields", () => {
//   it("Should parse fields that have repeating values into objects with indices/properties starting with 0", () => {
//     let pid1_13_field = "^PRN^PH^^^111^1111111~^NET^Internet^offered";
//     let expectedOutput = ["^PRN^PH^^^111^1111111", "^NET^Internet^offered"];
//     let parsed = parseRepeatingField(pid1_13_field);
//     expect(JSON.stringify(parsed)).to.equal(JSON.stringify(expectedOutput));
//   });
//   it("Should parse fields that do not have repeating values and just return the string value back", () => {
//     let pid1_13_field = "^123^987";
//     let expectedOutput = ["^123^987"];
//     let parsed = parseRepeatingField(pid1_13_field);
//     expect(JSON.stringify(parsed)).to.equal(JSON.stringify(expectedOutput));
//   });
// });

// describe("Parse Components Fields", () => {
//   it("Should parse fields into each components with 1-based index value", () => {
//     let pid1_13_field = "^PRN^PH^^^111^1111111";
//     let expectedOutput = {
//       1: "",
//       2: "PRN",
//       3: "PH",
//       4: "",
//       5: "",
//       6: "111",
//       7: "1111111",
//     };
//     let parsed = parseComponent(pid1_13_field);
//     expect(JSON.stringify(parsed)).to.equal(JSON.stringify(expectedOutput));
//   });
//   it("Should parse fields that do not have components values and just return the string value back", () => {
//     let pid1_13_field = "1242140";
//     let expectedOutput = "1242140";
//     let parsed = parseComponent(pid1_13_field);
//     expect(parsed).to.equal(expectedOutput);
//   });
// });

// describe("Parse HL7 Message", () => {
//   it("Should Parse HL7 Message Entirely", () => {
//     let rawHL7v2 = `MSH|^~\\&|NextGen Rosetta|NextGen Clinic^0001|Billing System|Billing System|20210512143447231||ORU^R01|396213227|P|2.5\rEVN||20210512143447\rPID|1|215061|000001039267^^^North East Medical Services^MR|c50b528c-8d49-407f-884a-743cdc319a66|TEST^DD||20110208|M||^Asian|INVALID^^INVALID^CA^99999^USA||^PRN^PH^^^111^1111111~^NET^Internet^offered||^Cantonese|S|^A|||||^Not Hispanic or Latino||||||||N\rPV1|1|O|1d433814-7fc9-418e-a2da-76fe075540ba||||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med|E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med||||||||||||||||||||||||||||||||||||201909111633||||||6561556\rORC||PRO6987293|1909110630||F||^^^^^R||20190911163524|873^Chew, EHR^Larry||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med\rOBR|1|PRO6987293|1909110630|CBC_AUTO^CBC W/AUTO DIFF|||20190911163627||||N|||||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med|||||||||F||^^^^^R\rOBX|1|ST|30000000^WBC||5.0|K/uL|4.5-13.5||||F|||20190911163627|CP\rOBX|2|ST|30000100^RBC||5.00|M/uL|4.30-5.90||||F|||20190911163627|CP\rOBX|3|ST|HGB^HGB||12.0|g/dL|11.5-14.5||||F|||20190911163627|CP\rOBX|4|ST|HCT^HEMATOCRIT||42.0|%|34.0-43.0||||F|||20190911163627|CP\rOBX|5|ST|30000400^MCV||88.0|fl|80.0-100.0||||F|||20190911163627|CP\rOBX|6|ST|30000500^Mean Cell Hemoglobin||28.0|pg|27.0-31.0||||F|||20190911163627|CP\rOBX|7|ST|30000600^MCHC||33.0|%|32.0-36.0||||F|||20190911163627|CP\rOBX|8|ST|30000700^RDW||13.0|Index|11.5-15.5||||F|||20190911163627|CP\rOBX|9|ST|PLT^PLATELET COUNT||258|Thousand/uL|140-400||||F|||20190911163627|CP\rOBX|10|ST|30004600^MPV||7.5|fl|7.4-10.4||||F|||20190911163627|CP\rOBX|11|ST|^# NEUTROPHIL||1.9|K/uL|1.8-7.7||||F|||20190911163627|CP\rOBX|12|ST|30002110^# LYMPHOCYTE||3.0|K/uL|1.0-4.8||||F|||20190911163627|CP\rOBX|13|ST|30002400^# MONOCYTE||1.0|K/uL|0.0-1.1||||F|||20190911163627|CP\rOBX|14|ST|30002700^# EOSINOPHIL||0.2|K/uL|0.0-0.5||||F|||20190911163627|CP\rOBX|15|ST|30003000^# BASOPHIL||0.2|K/uL|0.0-0.2||||F|||20190911163627|CP\rOBX|16|ST|30000900^% NEUTROPHIL||40.0|%|40.0-70.0||||F|||20190911163627|CP\rOBX|17|ST|30001800^% LYMPHOCYTE||23.0|%|22.0-44.0||||F|||20190911163627|CP\rOBX|18|ST|30002200^% MONOCYTE||10.0|%|0.0-10.0||||F|||20190911163627|CP\rOBX|19|ST|^% EOSINOPHIL||5.0|%|0.0-5.0||||F|||20190911163627|CP\rOBX|20|ST|30002800^% BASOPHIL||2.0|%|0.0-2.0||||F|||20190911163627|CP`;
//     let msg = parseHL7v2Message(rawHL7v2);
//     msg["MSH"]?.[1].should.equal("NextGen Rosetta");
//   });
// });

describe("Parse HL7 Message", () => {
  it("Should Parse HL7 Message Entirely", () => {
    let rawHL7v2 = `MSH|^~\\&|NextGen Rosetta|NextGen Clinic^0001|Billing System|Billing System|20210512143447231||ORU^R01|396213227|P|2.5\rEVN||20210512143447\rPID|1|215061|000001039267^^^North East Medical Services^MR|c50b528c-8d49-407f-884a-743cdc319a66|TEST^DD||20110208|M||^Asian|INVALID^^INVALID^CA^99999^USA||^PRN^PH^^^111^1111111~^NET^Internet^offered||^Cantonese|S|^A|||||^Not Hispanic or Latino||||||||N\rPV1|1|O|1d433814-7fc9-418e-a2da-76fe075540ba||||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med|E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med||||||||||||||||||||||||||||||||||||201909111633||||||6561556\rORC||PRO6987293|1909110630||F||^^^^^R||20190911163524|873^Chew, EHR^Larry||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med\rOBR|1|PRO6987293|1909110630|CBC_AUTO^CBC W/AUTO DIFF|||20190911163627||||N|||||E1E79CE3-070B-48EB-B898-DC498F6EFCAA^Abstracted^Med|||||||||F||^^^^^R\rOBX|1|ST|30000000^WBC||5.0|K/uL|4.5-13.5||||F|||20190911163627|CP\rOBX|2|ST|30000100^RBC||5.00|M/uL|4.30-5.90||||F|||20190911163627|CP\rOBX|3|ST|HGB^HGB||12.0|g/dL|11.5-14.5||||F|||20190911163627|CP\rOBX|4|ST|HCT^HEMATOCRIT||42.0|%|34.0-43.0||||F|||20190911163627|CP\rOBX|5|ST|30000400^MCV||88.0|fl|80.0-100.0||||F|||20190911163627|CP\rOBX|6|ST|30000500^Mean Cell Hemoglobin||28.0|pg|27.0-31.0||||F|||20190911163627|CP\rOBX|7|ST|30000600^MCHC||33.0|%|32.0-36.0||||F|||20190911163627|CP\rOBX|8|ST|30000700^RDW||13.0|Index|11.5-15.5||||F|||20190911163627|CP\rOBX|9|ST|PLT^PLATELET COUNT||258|Thousand/uL|140-400||||F|||20190911163627|CP\rOBX|10|ST|30004600^MPV||7.5|fl|7.4-10.4||||F|||20190911163627|CP\rOBX|11|ST|^# NEUTROPHIL||1.9|K/uL|1.8-7.7||||F|||20190911163627|CP\rOBX|12|ST|30002110^# LYMPHOCYTE||3.0|K/uL|1.0-4.8||||F|||20190911163627|CP\rOBX|13|ST|30002400^# MONOCYTE||1.0|K/uL|0.0-1.1||||F|||20190911163627|CP\rOBX|14|ST|30002700^# EOSINOPHIL||0.2|K/uL|0.0-0.5||||F|||20190911163627|CP\rOBX|15|ST|30003000^# BASOPHIL||0.2|K/uL|0.0-0.2||||F|||20190911163627|CP\rOBX|16|ST|30000900^% NEUTROPHIL||40.0|%|40.0-70.0||||F|||20190911163627|CP\rOBX|17|ST|30001800^% LYMPHOCYTE||23.0|%|22.0-44.0||||F|||20190911163627|CP\rOBX|18|ST|30002200^% MONOCYTE||10.0|%|0.0-10.0||||F|||20190911163627|CP\rOBX|19|ST|^% EOSINOPHIL||5.0|%|0.0-5.0||||F|||20190911163627|CP\rOBX|20|ST|30002800^% BASOPHIL||2.0|%|0.0-2.0||||F|||20190911163627|CP`;
    let msg = new HL7v2Message(rawHL7v2);
    let hl7 = msg.parse();
    return msg.get('$["OBX.2"]["2"]["0"]').should.exist;
  });
});

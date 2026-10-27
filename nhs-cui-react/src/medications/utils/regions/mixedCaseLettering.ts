/**
 * Mixed-case (Tall Man) lettering lists, keyed by region. The forms are name-specific and must be
 * applied exactly as published (never computed). GB has no national list (MEDi-001 notes Tall Man
 * is under research), so it is empty.
 */
import type { ClinicalRegion } from '../../../core';

/**
 * Australia: ACSQHC National Mixed-Case Lettering List, April 2024 (formerly National Tall Man
 * Lettering List). Licence CC BY-NC-ND 4.0: embedded verbatim, forms not modified.
 * Source: https://safetyandquality.gov.au/sites/default/files/2024-04/national_mixed-case_lettering_list.pdf
 * Transcribed via docs/guidance-notes/G10-australia.md section 9.3 (casing to be re-checked against the PDF before release).
 * Each line is one look-alike, sound-alike group. Entries in brackets are alternative names.
 */
export const AU_MIXED_CASE_LETTERING_GROUPS: readonly string[] = [
  // Table 1, general list
  'actoNEL, actoS', 'aKAMin, aCLin', 'alDOMET, alDACTONE, alODORM', 'amARYl, amOXil', 'amiODAROne, amLODIPine',
  'amLODIPine, amiTRIPTYLine', 'amiTRIPTYLine, amiNOPHYLLine', 'aPomine, aVomine', 'arATAC, arOPAX, arABLOC',
  'ARIPiprazole, RABEprazole', 'aTRopt, aZopt', 'azATHIOPRINE, aziTHROMYCIN, ERYthromycin', 'bisOPROLOl, bisACODYl',
  'buMETANide, buDESONide', 'caRAFate, caLTRate', 'CARBAMazepine, OXCARBazepine, carbiMAZOLe', 'caRVEDILOl, caPTOPRil',
  'celAPRAM, celEBREX', 'ciprAMIL, ciprOXIN', 'cLARITHROMYcin, ciPROFLOXAcin', 'cLOMIPRAMine, cLOMIFEne, cHLORPROMAZine',
  'coUMADIN, coVERSYL', 'ciclosPORIN, cyclosERINE', 'cycLONEX, cycLIZINE', 'DEPO-medrol, SOLU-medrol', 'DEPO-medrol, depo-PROVERA',
  'solu-CORTEF, SOLU-medrol', 'dePTRAn, deRALin', 'dexAMETHASOne, dexMEDETOMIDine', 'dilaUDID, dilaNTIN', 'diPRIVan, diTROPan',
  'diPYRIDAMOLe, diSOPYRAMIDe', 'doSULepin (doTHiepin), doXepin', 'flucLOXACILLIN, flucONAZOLe, flucYTOSINe', 'humALOG, humULIN',
  'hydreA, hydreNE', 'hydrALAZINe, hydrOCHLOROTHIAZIDe', 'isopto HOMATROpine, isopto CARpine', 'iSOtretinoin, tretinoin',
  'januMET, januVIA', 'ketALAR, ketOROLAC', 'laMICTAl, laRGACTil, laMISil', 'lamiVUDine, lamOTRIGine', 'lanTUs, lanVis',
  'linCOMYCIN, linEZOLID', 'loSEC, loVAN', 'mercaptAMine (cysteamine), mercaptOPURine', 'methADONe, methYLPHENIDATe',
  'MOXifloxacin, NORfloxacin', 'moBILis, moVALis', 'morphine, HYDROmorphone', 'NEOral, INDEral', 'nexAVAR, nexiUM',
  'niMODIPine, niFEDIPine, niZATIDine', 'norVASC, norMISON', 'novoMIX, novoRAPID', 'oxyCONTIN, MS Contin, oxyNORM',
  'paXTINE, paRIET', 'pEXSIG, pRISTIQ', 'primaXIN, primaCOR, primaCIN', 'proGRAF, proZAC', 'proMETHazine, proCHLORPERazine',
  'propRANOLol, propOFol', 'QUETIAPine, SERTRALine', 'rifaMPICin, rifaXIMin', 'riSPERIDONe, rOPINIROLe',
  'siTagliptin, sAXagliptin, sUMATRIPTAn', 'Sirolimus, TACrolimus', 'sulfaSALazine, sulfaDiazine', 'toPAMAX, toFRANIL',
  'tEGRETOl, tRENTAl', 'tRAMadol, tEMOdal, tORadol, tAPENTadol', 'trimETHOPRIM, alimemazine (trimEPRAZINE)',
  'valAciclovir, valGANciclovir', 'xalaTAN, xalaCOM', 'zinVit, zinNAt', 'zoCOR, zoTON', 'zoLOFT, zoCOR',
  // Table 2, cancer therapy
  'ALKeran, LEUKeran, MYLeran', 'avaSTIN, avaXIM', 'ciSplatin, cARBOplatin', 'daCTINomycin, daPTomycin',
  'DAUNOrubicin, DOXOrubicin, iDArubicin', 'iFOSFamide, CYCLOPHOSPHamide', 'PACLitaxel, DOCEtaxel, CABAZitaxel',
  'vinBLASTine, vinCRISTine, vinORELBine',
  // Table 3, classes
  'cefaLEXin, cefALOTIN, cefaZOLin, cefEPIME, cefOTAXIME, cefOXITIN, ceftAROLine, cefTAZIDIME, cefTRIAXONE',
  'cloBAZam, CLONazepam, DIAzepam, LORazepam, OXazepam', 'DULoxetine, fluoxetine, fluVOXAMine, PARoxetine',
  'gliBENCLAMide, gliCLAZide, gliMEPIRide, gliPIZide',
  // Table 4, -mab
  'beNRALizumab, beVACizumab, beZLOTOXumab', 'eCULizumab, eFALizumab, eMICizumab', 'oBINUTUZumab, oFATUMumab',
  'oCRELizumab, oMALizumab', 'pANITUMumab, pERTUZumab', 'raMUCIRumab, raNIBIZumab',
  // Table 5, -nib / -gib
  'aFATinib, aXITinib', 'bARICITinib, biNIMEtinib', 'cABOZANtinib, cOBIMEtinib', 'daBRAFEnib, daSATinib', 'laPAtinib, leNVAtinib',
  'pAZOPanib, pONATinib', 'soNIDEGib, soRAFENib, sUNITinib', 'tOFACitinib, tRAMEtinib',
];

/**
 * New Zealand: HQSC Aotearoa New Zealand Tall Man lettering list, October 2023 (224 names with the
 * 2013 and 2020 lists). A trailing "*" marks a name deliberately not capitalised under the exception rules.
 * Source: https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/Aotearoa_New_Zealand_Tall_Man_lettering_list_Oct_2023.xlsx
 * Transcribed via docs/guidance-notes/G11-new-zealand.md section 8.4 (the XLSX remains authoritative).
 */
const NZ_TALL_MAN_SOURCE = `
aFATinib aLEMTUzumab ALKeran aLLOPURINol amINOPHYLLIne amIODAROne amiSULPRIDe
amITRIPTYLIne amLODIPIne aPomine arATAC arOPAX aTENOLol aTEZOLIzumab aTRopt
avaSTIN avaXIM aVomine aXITinib azATHIOPRINE azITHROMYCIN aZopt
"BENZATHINE benzylpenicillin" benzylpenicillin* beVACizumab bisACODYl bisOPROLOl
buDESONide buMETANide buPROPION buSPIRONE caLTRate caPTOPRIl caRAFate
CARBAMazepine carbIMAZOLe cARBOplatin caRVEDILOl cefaCLOR cefaLEXin cefaZOLin
cefEPIME cefOTAXIME cefOXITIN ceftAROLine cefTAZIDIME cefTRIAXONE cefUROXIME
celAPRAM celEBREX cephaLEXin cephaZOLin CETUximab cHLORPROMAZIne ciclosPORIN
ciprAMIL cIPROFLOXAcin ciprOXIN cISplatin cLARITHROMYcin clINDAmycin clobazam*
cLOMIFEne cLOMIPHEne cLOMIPRAMIne CLONazepam cloNIDine cLOZAPine cOBIMEtinib
coUMADIN coVERSYL cyclIZINE cyclOBLASTIN CYCLOPHOSPHamide cyclosERINE cyclosPORIN
daBRAFEnib daCTINomycin daPTomycin daSATinib DAUNOrubicin DEPO-medrol depo-PROVERA
DIazepam dIGOXin diPYRIDAMOLe diSOPYRAMIDe doBUTamine DOCEtaxel doPamine doTHIEpin
dOXAZOSin doXEpin DOXOrubicin DULoxetine ERYthromycin fluoxetine* fluARIx
flupENTIXOL flupENTHIXOL flupHENAZINE fluVAx fluVOXAMine "folic acid*" "foliNIc acid"
gliBENCLAMide gliCLAZide gliPIZide humALOG humULIN "hyoscine BUTYLbromide"
"hyoscine HYDRObromide" IDArubicin IFOSFamide imipramine* imUPRine INDEral
INFLIximab "isopto CARpine" "isopto HOMATROpine" ISOtretinoin januMET januVIA
ketALAR ketOROLAC laMICTAl laMISIl lamIVUDine lamOTRIGine lanTUs lanVIs laPAtinib
laRGACTIl LEUKeran LORazepam loxaLATe loxaMINe maxiDEX maxiTROL meDROXYPROGESTERone
m-eNALAPRIL "mercaptAMine (cysteamine)" mercaptOPURine m-eSLON methADONe metHOTREXATe
methYLPHENIDATe "methylprednisolone ACETate" "methylprednisolone SODIUM SUCCINate"
metOCLOPRAMIDe metoPROLOL MOXIfloxacin MYLeran nalOXone nalTREXone neO-MERCAZOLe
NEOral neUROKARe niFEDIPine niMODIPine NITRazepam NORfloxacin norMISON norVASC
novoMIX novoRAPID novoSEVEN oBINUTUZumab oMALizumab OXazepam OXCARBazepine oxyCONTIN
oxyNORM PACLItaxel PARoxetine pAZOPanib pegFILGRASTIM pegINTERFERON penicillAMINE
pERTUZumab prEDNISone primaCIN primaCOR primAQUIne primaXIN primIDOne
proCHLORPERazine procYCLIDine proGRAF proMETHazine propOFol propRANOLol proZAC
QUETIAPine quINine rifaMPICin rifaXIMin riSPERIDONe RITUximab rOPINIROLe SERTRALine
SIrolimus siTagliptin solu-CORTEF SOLU-medrol soRAFENib sulfaDIazine sulfaSALazine
sUMATRIPTAn sUNITinib TACrolimus TAMoxifen tEMOdal toFRANIL toPAMAX tRAMadol
tretinoin* trimEPRAZINE trimETHOPRIM valAciclovir valGANciclovir vinBLASTine
vinCRISTine vinORELBine yasMIN yaZ
`;

/** Every published form for a list, flattening groups and bracketed alternatives. "*" entries keep their plain lower-case form. */
function parseForms(source: string): string[] {
  const out: string[] = [];
  const re = /"([^"]+)"|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const raw = (m[1] ?? m[2]).trim();
    // "mercaptAMine (cysteamine)": both the name and the bracketed alternative are forms.
    const bracket = /^(.*?)\s*\(([^)]+)\)$/.exec(raw);
    const forms = bracket ? [bracket[1], bracket[2]] : [raw];
    for (const f of forms) {
      const exception = f.endsWith('*');
      const form = exception ? f.slice(0, -1).toLowerCase() : f;
      if (form) out.push(form);
    }
  }
  return out;
}

/** AU: every form in the National Mixed-Case Lettering List (April 2024). */
export const AU_MIXED_CASE_LETTERING: readonly string[] = AU_MIXED_CASE_LETTERING_GROUPS.flatMap(g =>
  g.split(/,\s*(?![^()]*\))/).flatMap(entry => parseForms(`"${entry.trim()}"`)),
);

/** NZ: every form in the HQSC Tall Man lettering list (October 2023). Exception names ("*") are present in lower case. */
export const NZ_TALL_MAN_LETTERING: readonly string[] = parseForms(NZ_TALL_MAN_SOURCE);

/** Edition of each regional list, for display in configuration screens and audit. */
export const TALL_MAN_LIST_EDITIONS: Record<ClinicalRegion, { name: string; edition: string; url: string } | null> = {
  GB: null,
  AU: {
    name: 'National Mixed-Case Lettering List (ACSQHC)',
    edition: 'April 2024',
    url: 'https://www.safetyandquality.gov.au/resources/national-mixed-case-lettering-list',
  },
  NZ: {
    name: 'Aotearoa New Zealand Tall Man lettering list (HQSC)',
    edition: 'October 2023',
    url: 'https://hqsc.govt.nz/resources/resource-library/aotearoa-new-zealand-tall-man-lettering-list',
  },
};

/** Forms per region (GB: none). */
export const TALL_MAN_LETTERING_FORMS: Record<ClinicalRegion, readonly string[]> = {
  GB: [],
  AU: AU_MIXED_CASE_LETTERING,
  NZ: NZ_TALL_MAN_LETTERING,
};

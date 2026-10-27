/**
 * ISO 3166-1 country names (ADR-0057, ADR-0058) with ITU-T E.164 country calling codes
 * (TID-0021). Names are the ISO 3166-1 English short names written in plain ASCII
 * (diacritics removed, as for the QIG list "Aland Islands"). The United Kingdom uses
 * "UK" rather than "GB" for its two-letter code (TID-0021).
 * Members of the North American Numbering Plan carry country code 1 only; their area
 * code is part of the number the user types.
 */
export interface PatientCountry {
  /** ISO 3166-1 short name. */
  name: string;
  /** ISO 3166-1 alpha-2 code, except "UK" for the United Kingdom (TID-0021). */
  code: string;
  /** ITU country calling code, digits only, no "+" (e.g. "44"). */
  dialCode: string;
}

const RAW =
  'Afghanistan|AF|93;Aland Islands|AX|358;Albania|AL|355;Algeria|DZ|213;American Samoa|AS|1;Andorra|AD|376;' +
  'Angola|AO|244;Anguilla|AI|1;Antarctica|AQ|672;Antigua and Barbuda|AG|1;Argentina|AR|54;Armenia|AM|374;' +
  'Aruba|AW|297;Australia|AU|61;Austria|AT|43;Azerbaijan|AZ|994;Bahamas|BS|1;Bahrain|BH|973;Bangladesh|BD|880;' +
  'Barbados|BB|1;Belarus|BY|375;Belgium|BE|32;Belize|BZ|501;Benin|BJ|229;Bermuda|BM|1;Bhutan|BT|975;' +
  'Bolivia (Plurinational State of)|BO|591;Bonaire, Sint Eustatius and Saba|BQ|599;Bosnia and Herzegovina|BA|387;' +
  'Botswana|BW|267;Bouvet Island|BV|47;Brazil|BR|55;British Indian Ocean Territory|IO|246;Brunei Darussalam|BN|673;' +
  'Bulgaria|BG|359;Burkina Faso|BF|226;Burundi|BI|257;Cabo Verde|CV|238;Cambodia|KH|855;Cameroon|CM|237;Canada|CA|1;' +
  'Cayman Islands|KY|1;Central African Republic|CF|236;Chad|TD|235;Chile|CL|56;China|CN|86;Christmas Island|CX|61;' +
  'Cocos (Keeling) Islands|CC|61;Colombia|CO|57;Comoros|KM|269;Congo|CG|242;Congo (Democratic Republic of the)|CD|243;' +
  'Cook Islands|CK|682;Costa Rica|CR|506;Cote d\'Ivoire|CI|225;Croatia|HR|385;Cuba|CU|53;Curacao|CW|599;Cyprus|CY|357;' +
  'Czechia|CZ|420;Denmark|DK|45;Djibouti|DJ|253;Dominica|DM|1;Dominican Republic|DO|1;Ecuador|EC|593;Egypt|EG|20;' +
  'El Salvador|SV|503;Equatorial Guinea|GQ|240;Eritrea|ER|291;Estonia|EE|372;Eswatini|SZ|268;Ethiopia|ET|251;' +
  'Falkland Islands (Malvinas)|FK|500;Faroe Islands|FO|298;Fiji|FJ|679;Finland|FI|358;France|FR|33;French Guiana|GF|594;' +
  'French Polynesia|PF|689;French Southern Territories|TF|262;Gabon|GA|241;Gambia|GM|220;Georgia|GE|995;Germany|DE|49;' +
  'Ghana|GH|233;Gibraltar|GI|350;Greece|GR|30;Greenland|GL|299;Grenada|GD|1;Guadeloupe|GP|590;Guam|GU|1;Guatemala|GT|502;' +
  'Guernsey|GG|44;Guinea|GN|224;Guinea-Bissau|GW|245;Guyana|GY|592;Haiti|HT|509;Heard Island and McDonald Islands|HM|672;' +
  'Holy See|VA|39;Honduras|HN|504;Hong Kong|HK|852;Hungary|HU|36;Iceland|IS|354;India|IN|91;Indonesia|ID|62;' +
  'Iran (Islamic Republic of)|IR|98;Iraq|IQ|964;Ireland|IE|353;Isle of Man|IM|44;Israel|IL|972;Italy|IT|39;Jamaica|JM|1;' +
  'Japan|JP|81;Jersey|JE|44;Jordan|JO|962;Kazakhstan|KZ|7;Kenya|KE|254;Kiribati|KI|686;' +
  'Korea (Democratic People\'s Republic of)|KP|850;Korea (Republic of)|KR|82;Kuwait|KW|965;Kyrgyzstan|KG|996;' +
  'Lao People\'s Democratic Republic|LA|856;Latvia|LV|371;Lebanon|LB|961;Lesotho|LS|266;Liberia|LR|231;Libya|LY|218;' +
  'Liechtenstein|LI|423;Lithuania|LT|370;Luxembourg|LU|352;Macao|MO|853;Madagascar|MG|261;Malawi|MW|265;Malaysia|MY|60;' +
  'Maldives|MV|960;Mali|ML|223;Malta|MT|356;Marshall Islands|MH|692;Martinique|MQ|596;Mauritania|MR|222;Mauritius|MU|230;' +
  'Mayotte|YT|262;Mexico|MX|52;Micronesia (Federated States of)|FM|691;Moldova (Republic of)|MD|373;Monaco|MC|377;' +
  'Mongolia|MN|976;Montenegro|ME|382;Montserrat|MS|1;Morocco|MA|212;Mozambique|MZ|258;Myanmar|MM|95;Namibia|NA|264;' +
  'Nauru|NR|674;Nepal|NP|977;Netherlands|NL|31;New Caledonia|NC|687;New Zealand|NZ|64;Nicaragua|NI|505;Niger|NE|227;' +
  'Nigeria|NG|234;Niue|NU|683;Norfolk Island|NF|672;North Macedonia|MK|389;Northern Mariana Islands|MP|1;Norway|NO|47;' +
  'Oman|OM|968;Pakistan|PK|92;Palau|PW|680;Palestine, State of|PS|970;Panama|PA|507;Papua New Guinea|PG|675;' +
  'Paraguay|PY|595;Peru|PE|51;Philippines|PH|63;Pitcairn|PN|64;Poland|PL|48;Portugal|PT|351;Puerto Rico|PR|1;Qatar|QA|974;' +
  'Reunion|RE|262;Romania|RO|40;Russian Federation|RU|7;Rwanda|RW|250;Saint Barthelemy|BL|590;' +
  'Saint Helena, Ascension and Tristan da Cunha|SH|290;Saint Kitts and Nevis|KN|1;Saint Lucia|LC|1;' +
  'Saint Martin (French part)|MF|590;Saint Pierre and Miquelon|PM|508;Saint Vincent and the Grenadines|VC|1;Samoa|WS|685;' +
  'San Marino|SM|378;Sao Tome and Principe|ST|239;Saudi Arabia|SA|966;Senegal|SN|221;Serbia|RS|381;Seychelles|SC|248;' +
  'Sierra Leone|SL|232;Singapore|SG|65;Sint Maarten (Dutch part)|SX|1;Slovakia|SK|421;Slovenia|SI|386;' +
  'Solomon Islands|SB|677;Somalia|SO|252;South Africa|ZA|27;South Georgia and the South Sandwich Islands|GS|500;' +
  'South Sudan|SS|211;Spain|ES|34;Sri Lanka|LK|94;Sudan|SD|249;Suriname|SR|597;Svalbard and Jan Mayen|SJ|47;' +
  'Sweden|SE|46;Switzerland|CH|41;Syrian Arab Republic|SY|963;Taiwan (Province of China)|TW|886;Tajikistan|TJ|992;' +
  'Tanzania, United Republic of|TZ|255;Thailand|TH|66;Timor-Leste|TL|670;Togo|TG|228;Tokelau|TK|690;Tonga|TO|676;' +
  'Trinidad and Tobago|TT|1;Tunisia|TN|216;Turkiye|TR|90;Turkmenistan|TM|993;Turks and Caicos Islands|TC|1;Tuvalu|TV|688;' +
  'Uganda|UG|256;Ukraine|UA|380;United Arab Emirates|AE|971;United Kingdom|UK|44;United States of America|US|1;' +
  'United States Minor Outlying Islands|UM|1;Uruguay|UY|598;Uzbekistan|UZ|998;Vanuatu|VU|678;' +
  'Venezuela (Bolivarian Republic of)|VE|58;Viet Nam|VN|84;Virgin Islands (British)|VG|1;Virgin Islands (U.S.)|VI|1;' +
  'Wallis and Futuna|WF|681;Western Sahara|EH|212;Yemen|YE|967;Zambia|ZM|260;Zimbabwe|ZW|263';

/** All ISO 3166-1 countries, alphabetical by name (ADR-0058, TID-0022). */
export const PATIENT_COUNTRIES: ReadonlyArray<PatientCountry> = RAW.split(';')
  .map((row) => {
    const [name, code, dialCode] = row.split('|');
    return { name, code, dialCode };
  })
  .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

/** Country names only, alphabetical (ADR-0057/0058). */
export const ISO_COUNTRY_NAMES: ReadonlyArray<string> = PATIENT_COUNTRIES.map((c) => c.name);

/** Distinct ITU country calling codes. The set is prefix-free, so the first match by length is unique. */
export const ITU_COUNTRY_CODES: ReadonlySet<string> = new Set(PATIENT_COUNTRIES.map((c) => c.dialCode));

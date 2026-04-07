// =============================================
// AUSWANDERUNG — Countries Database
// Alle ~195 UN-anerkannte Länder mit deutschen Namen
// =============================================

window.CountriesDB = (function () {

  var countries = [
    // --- EUROPA ---
    { name: 'Albania', nameDE: 'Albanien', iso: 'AL', flag: '\u{1F1E6}\u{1F1F1}', region: 'europe', schengen: false },
    { name: 'Andorra', nameDE: 'Andorra', iso: 'AD', flag: '\u{1F1E6}\u{1F1E9}', region: 'europe', schengen: false },
    { name: 'Austria', nameDE: '\u00D6sterreich', iso: 'AT', flag: '\u{1F1E6}\u{1F1F9}', region: 'europe', schengen: true },
    { name: 'Belarus', nameDE: 'Belarus', iso: 'BY', flag: '\u{1F1E7}\u{1F1FE}', region: 'europe', schengen: false },
    { name: 'Belgium', nameDE: 'Belgien', iso: 'BE', flag: '\u{1F1E7}\u{1F1EA}', region: 'europe', schengen: true },
    { name: 'Bosnia and Herzegovina', nameDE: 'Bosnien und Herzegowina', iso: 'BA', flag: '\u{1F1E7}\u{1F1E6}', region: 'europe', schengen: false },
    { name: 'Bulgaria', nameDE: 'Bulgarien', iso: 'BG', flag: '\u{1F1E7}\u{1F1EC}', region: 'europe', schengen: true },
    { name: 'Croatia', nameDE: 'Kroatien', iso: 'HR', flag: '\u{1F1ED}\u{1F1F7}', region: 'europe', schengen: true },
    { name: 'Cyprus', nameDE: 'Zypern', iso: 'CY', flag: '\u{1F1E8}\u{1F1FE}', region: 'europe', schengen: false },
    { name: 'Czech Republic', nameDE: 'Tschechien', iso: 'CZ', flag: '\u{1F1E8}\u{1F1FF}', region: 'europe', schengen: true },
    { name: 'Denmark', nameDE: 'D\u00E4nemark', iso: 'DK', flag: '\u{1F1E9}\u{1F1F0}', region: 'europe', schengen: true },
    { name: 'Estonia', nameDE: 'Estland', iso: 'EE', flag: '\u{1F1EA}\u{1F1EA}', region: 'europe', schengen: true },
    { name: 'Finland', nameDE: 'Finnland', iso: 'FI', flag: '\u{1F1EB}\u{1F1EE}', region: 'europe', schengen: true },
    { name: 'France', nameDE: 'Frankreich', iso: 'FR', flag: '\u{1F1EB}\u{1F1F7}', region: 'europe', schengen: true },
    { name: 'Germany', nameDE: 'Deutschland', iso: 'DE', flag: '\u{1F1E9}\u{1F1EA}', region: 'europe', schengen: true },
    { name: 'Greece', nameDE: 'Griechenland', iso: 'GR', flag: '\u{1F1EC}\u{1F1F7}', region: 'europe', schengen: true },
    { name: 'Hungary', nameDE: 'Ungarn', iso: 'HU', flag: '\u{1F1ED}\u{1F1FA}', region: 'europe', schengen: true },
    { name: 'Iceland', nameDE: 'Island', iso: 'IS', flag: '\u{1F1EE}\u{1F1F8}', region: 'europe', schengen: true },
    { name: 'Ireland', nameDE: 'Irland', iso: 'IE', flag: '\u{1F1EE}\u{1F1EA}', region: 'europe', schengen: false },
    { name: 'Italy', nameDE: 'Italien', iso: 'IT', flag: '\u{1F1EE}\u{1F1F9}', region: 'europe', schengen: true },
    { name: 'Kosovo', nameDE: 'Kosovo', iso: 'XK', flag: '\u{1F1FD}\u{1F1F0}', region: 'europe', schengen: false },
    { name: 'Latvia', nameDE: 'Lettland', iso: 'LV', flag: '\u{1F1F1}\u{1F1FB}', region: 'europe', schengen: true },
    { name: 'Liechtenstein', nameDE: 'Liechtenstein', iso: 'LI', flag: '\u{1F1F1}\u{1F1EE}', region: 'europe', schengen: true },
    { name: 'Lithuania', nameDE: 'Litauen', iso: 'LT', flag: '\u{1F1F1}\u{1F1F9}', region: 'europe', schengen: true },
    { name: 'Luxembourg', nameDE: 'Luxemburg', iso: 'LU', flag: '\u{1F1F1}\u{1F1FA}', region: 'europe', schengen: true },
    { name: 'Malta', nameDE: 'Malta', iso: 'MT', flag: '\u{1F1F2}\u{1F1F9}', region: 'europe', schengen: true },
    { name: 'Moldova', nameDE: 'Moldau', iso: 'MD', flag: '\u{1F1F2}\u{1F1E9}', region: 'europe', schengen: false },
    { name: 'Monaco', nameDE: 'Monaco', iso: 'MC', flag: '\u{1F1F2}\u{1F1E8}', region: 'europe', schengen: false },
    { name: 'Montenegro', nameDE: 'Montenegro', iso: 'ME', flag: '\u{1F1F2}\u{1F1EA}', region: 'europe', schengen: false },
    { name: 'Netherlands', nameDE: 'Niederlande', iso: 'NL', flag: '\u{1F1F3}\u{1F1F1}', region: 'europe', schengen: true },
    { name: 'North Macedonia', nameDE: 'Nordmazedonien', iso: 'MK', flag: '\u{1F1F2}\u{1F1F0}', region: 'europe', schengen: false },
    { name: 'Norway', nameDE: 'Norwegen', iso: 'NO', flag: '\u{1F1F3}\u{1F1F4}', region: 'europe', schengen: true },
    { name: 'Poland', nameDE: 'Polen', iso: 'PL', flag: '\u{1F1F5}\u{1F1F1}', region: 'europe', schengen: true },
    { name: 'Portugal', nameDE: 'Portugal', iso: 'PT', flag: '\u{1F1F5}\u{1F1F9}', region: 'europe', schengen: true },
    { name: 'Romania', nameDE: 'Rum\u00E4nien', iso: 'RO', flag: '\u{1F1F7}\u{1F1F4}', region: 'europe', schengen: true },
    { name: 'Russia', nameDE: 'Russland', iso: 'RU', flag: '\u{1F1F7}\u{1F1FA}', region: 'europe', schengen: false },
    { name: 'San Marino', nameDE: 'San Marino', iso: 'SM', flag: '\u{1F1F8}\u{1F1F2}', region: 'europe', schengen: false },
    { name: 'Serbia', nameDE: 'Serbien', iso: 'RS', flag: '\u{1F1F7}\u{1F1F8}', region: 'europe', schengen: false },
    { name: 'Slovakia', nameDE: 'Slowakei', iso: 'SK', flag: '\u{1F1F8}\u{1F1F0}', region: 'europe', schengen: true },
    { name: 'Slovenia', nameDE: 'Slowenien', iso: 'SI', flag: '\u{1F1F8}\u{1F1EE}', region: 'europe', schengen: true },
    { name: 'Spain', nameDE: 'Spanien', iso: 'ES', flag: '\u{1F1EA}\u{1F1F8}', region: 'europe', schengen: true },
    { name: 'Sweden', nameDE: 'Schweden', iso: 'SE', flag: '\u{1F1F8}\u{1F1EA}', region: 'europe', schengen: true },
    { name: 'Switzerland', nameDE: 'Schweiz', iso: 'CH', flag: '\u{1F1E8}\u{1F1ED}', region: 'europe', schengen: true },
    { name: 'Ukraine', nameDE: 'Ukraine', iso: 'UA', flag: '\u{1F1FA}\u{1F1E6}', region: 'europe', schengen: false },
    { name: 'United Kingdom', nameDE: 'Vereinigtes K\u00F6nigreich', iso: 'GB', flag: '\u{1F1EC}\u{1F1E7}', region: 'europe', schengen: false },
    { name: 'Vatican City', nameDE: 'Vatikanstadt', iso: 'VA', flag: '\u{1F1FB}\u{1F1E6}', region: 'europe', schengen: false },

    // --- ASIEN ---
    { name: 'Afghanistan', nameDE: 'Afghanistan', iso: 'AF', flag: '\u{1F1E6}\u{1F1EB}', region: 'asia', schengen: false },
    { name: 'Armenia', nameDE: 'Armenien', iso: 'AM', flag: '\u{1F1E6}\u{1F1F2}', region: 'asia', schengen: false },
    { name: 'Azerbaijan', nameDE: 'Aserbaidschan', iso: 'AZ', flag: '\u{1F1E6}\u{1F1FF}', region: 'asia', schengen: false },
    { name: 'Bahrain', nameDE: 'Bahrain', iso: 'BH', flag: '\u{1F1E7}\u{1F1ED}', region: 'asia', schengen: false },
    { name: 'Bangladesh', nameDE: 'Bangladesch', iso: 'BD', flag: '\u{1F1E7}\u{1F1E9}', region: 'asia', schengen: false },
    { name: 'Bhutan', nameDE: 'Bhutan', iso: 'BT', flag: '\u{1F1E7}\u{1F1F9}', region: 'asia', schengen: false },
    { name: 'Brunei', nameDE: 'Brunei', iso: 'BN', flag: '\u{1F1E7}\u{1F1F3}', region: 'asia', schengen: false },
    { name: 'Cambodia', nameDE: 'Kambodscha', iso: 'KH', flag: '\u{1F1F0}\u{1F1ED}', region: 'asia', schengen: false },
    { name: 'China', nameDE: 'China', iso: 'CN', flag: '\u{1F1E8}\u{1F1F3}', region: 'asia', schengen: false },
    { name: 'Georgia', nameDE: 'Georgien', iso: 'GE', flag: '\u{1F1EC}\u{1F1EA}', region: 'asia', schengen: false },
    { name: 'India', nameDE: 'Indien', iso: 'IN', flag: '\u{1F1EE}\u{1F1F3}', region: 'asia', schengen: false },
    { name: 'Indonesia', nameDE: 'Indonesien', iso: 'ID', flag: '\u{1F1EE}\u{1F1E9}', region: 'asia', schengen: false },
    { name: 'Iran', nameDE: 'Iran', iso: 'IR', flag: '\u{1F1EE}\u{1F1F7}', region: 'asia', schengen: false },
    { name: 'Iraq', nameDE: 'Irak', iso: 'IQ', flag: '\u{1F1EE}\u{1F1F6}', region: 'asia', schengen: false },
    { name: 'Israel', nameDE: 'Israel', iso: 'IL', flag: '\u{1F1EE}\u{1F1F1}', region: 'asia', schengen: false },
    { name: 'Japan', nameDE: 'Japan', iso: 'JP', flag: '\u{1F1EF}\u{1F1F5}', region: 'asia', schengen: false },
    { name: 'Jordan', nameDE: 'Jordanien', iso: 'JO', flag: '\u{1F1EF}\u{1F1F4}', region: 'asia', schengen: false },
    { name: 'Kazakhstan', nameDE: 'Kasachstan', iso: 'KZ', flag: '\u{1F1F0}\u{1F1FF}', region: 'asia', schengen: false },
    { name: 'Kuwait', nameDE: 'Kuwait', iso: 'KW', flag: '\u{1F1F0}\u{1F1FC}', region: 'asia', schengen: false },
    { name: 'Kyrgyzstan', nameDE: 'Kirgisistan', iso: 'KG', flag: '\u{1F1F0}\u{1F1EC}', region: 'asia', schengen: false },
    { name: 'Laos', nameDE: 'Laos', iso: 'LA', flag: '\u{1F1F1}\u{1F1E6}', region: 'asia', schengen: false },
    { name: 'Lebanon', nameDE: 'Libanon', iso: 'LB', flag: '\u{1F1F1}\u{1F1E7}', region: 'asia', schengen: false },
    { name: 'Malaysia', nameDE: 'Malaysia', iso: 'MY', flag: '\u{1F1F2}\u{1F1FE}', region: 'asia', schengen: false },
    { name: 'Maldives', nameDE: 'Malediven', iso: 'MV', flag: '\u{1F1F2}\u{1F1FB}', region: 'asia', schengen: false },
    { name: 'Mongolia', nameDE: 'Mongolei', iso: 'MN', flag: '\u{1F1F2}\u{1F1F3}', region: 'asia', schengen: false },
    { name: 'Myanmar', nameDE: 'Myanmar', iso: 'MM', flag: '\u{1F1F2}\u{1F1F2}', region: 'asia', schengen: false },
    { name: 'Nepal', nameDE: 'Nepal', iso: 'NP', flag: '\u{1F1F3}\u{1F1F5}', region: 'asia', schengen: false },
    { name: 'North Korea', nameDE: 'Nordkorea', iso: 'KP', flag: '\u{1F1F0}\u{1F1F5}', region: 'asia', schengen: false },
    { name: 'Oman', nameDE: 'Oman', iso: 'OM', flag: '\u{1F1F4}\u{1F1F2}', region: 'asia', schengen: false },
    { name: 'Pakistan', nameDE: 'Pakistan', iso: 'PK', flag: '\u{1F1F5}\u{1F1F0}', region: 'asia', schengen: false },
    { name: 'Palestine', nameDE: 'Pal\u00E4stina', iso: 'PS', flag: '\u{1F1F5}\u{1F1F8}', region: 'asia', schengen: false },
    { name: 'Philippines', nameDE: 'Philippinen', iso: 'PH', flag: '\u{1F1F5}\u{1F1ED}', region: 'asia', schengen: false },
    { name: 'Qatar', nameDE: 'Katar', iso: 'QA', flag: '\u{1F1F6}\u{1F1E6}', region: 'asia', schengen: false },
    { name: 'Saudi Arabia', nameDE: 'Saudi-Arabien', iso: 'SA', flag: '\u{1F1F8}\u{1F1E6}', region: 'asia', schengen: false },
    { name: 'Singapore', nameDE: 'Singapur', iso: 'SG', flag: '\u{1F1F8}\u{1F1EC}', region: 'asia', schengen: false },
    { name: 'South Korea', nameDE: 'S\u00FCdkorea', iso: 'KR', flag: '\u{1F1F0}\u{1F1F7}', region: 'asia', schengen: false },
    { name: 'Sri Lanka', nameDE: 'Sri Lanka', iso: 'LK', flag: '\u{1F1F1}\u{1F1F0}', region: 'asia', schengen: false },
    { name: 'Syria', nameDE: 'Syrien', iso: 'SY', flag: '\u{1F1F8}\u{1F1FE}', region: 'asia', schengen: false },
    { name: 'Taiwan', nameDE: 'Taiwan', iso: 'TW', flag: '\u{1F1F9}\u{1F1FC}', region: 'asia', schengen: false },
    { name: 'Tajikistan', nameDE: 'Tadschikistan', iso: 'TJ', flag: '\u{1F1F9}\u{1F1EF}', region: 'asia', schengen: false },
    { name: 'Thailand', nameDE: 'Thailand', iso: 'TH', flag: '\u{1F1F9}\u{1F1ED}', region: 'asia', schengen: false },
    { name: 'Timor-Leste', nameDE: 'Osttimor', iso: 'TL', flag: '\u{1F1F9}\u{1F1F1}', region: 'asia', schengen: false },
    { name: 'Turkey', nameDE: 'T\u00FCrkei', iso: 'TR', flag: '\u{1F1F9}\u{1F1F7}', region: 'asia', schengen: false },
    { name: 'Turkmenistan', nameDE: 'Turkmenistan', iso: 'TM', flag: '\u{1F1F9}\u{1F1F2}', region: 'asia', schengen: false },
    { name: 'United Arab Emirates', nameDE: 'Vereinigte Arabische Emirate', iso: 'AE', flag: '\u{1F1E6}\u{1F1EA}', region: 'asia', schengen: false },
    { name: 'Uzbekistan', nameDE: 'Usbekistan', iso: 'UZ', flag: '\u{1F1FA}\u{1F1FF}', region: 'asia', schengen: false },
    { name: 'Vietnam', nameDE: 'Vietnam', iso: 'VN', flag: '\u{1F1FB}\u{1F1F3}', region: 'asia', schengen: false },
    { name: 'Yemen', nameDE: 'Jemen', iso: 'YE', flag: '\u{1F1FE}\u{1F1EA}', region: 'asia', schengen: false },

    // --- AFRIKA ---
    { name: 'Algeria', nameDE: 'Algerien', iso: 'DZ', flag: '\u{1F1E9}\u{1F1FF}', region: 'africa', schengen: false },
    { name: 'Angola', nameDE: 'Angola', iso: 'AO', flag: '\u{1F1E6}\u{1F1F4}', region: 'africa', schengen: false },
    { name: 'Benin', nameDE: 'Benin', iso: 'BJ', flag: '\u{1F1E7}\u{1F1EF}', region: 'africa', schengen: false },
    { name: 'Botswana', nameDE: 'Botswana', iso: 'BW', flag: '\u{1F1E7}\u{1F1FC}', region: 'africa', schengen: false },
    { name: 'Burkina Faso', nameDE: 'Burkina Faso', iso: 'BF', flag: '\u{1F1E7}\u{1F1EB}', region: 'africa', schengen: false },
    { name: 'Burundi', nameDE: 'Burundi', iso: 'BI', flag: '\u{1F1E7}\u{1F1EE}', region: 'africa', schengen: false },
    { name: 'Cabo Verde', nameDE: 'Kap Verde', iso: 'CV', flag: '\u{1F1E8}\u{1F1FB}', region: 'africa', schengen: false },
    { name: 'Cameroon', nameDE: 'Kamerun', iso: 'CM', flag: '\u{1F1E8}\u{1F1F2}', region: 'africa', schengen: false },
    { name: 'Central African Republic', nameDE: 'Zentralafrikanische Republik', iso: 'CF', flag: '\u{1F1E8}\u{1F1EB}', region: 'africa', schengen: false },
    { name: 'Chad', nameDE: 'Tschad', iso: 'TD', flag: '\u{1F1F9}\u{1F1E9}', region: 'africa', schengen: false },
    { name: 'Comoros', nameDE: 'Komoren', iso: 'KM', flag: '\u{1F1F0}\u{1F1F2}', region: 'africa', schengen: false },
    { name: 'Congo (DRC)', nameDE: 'Kongo (Demokratische Republik)', iso: 'CD', flag: '\u{1F1E8}\u{1F1E9}', region: 'africa', schengen: false },
    { name: 'Congo (Republic)', nameDE: 'Kongo (Republik)', iso: 'CG', flag: '\u{1F1E8}\u{1F1EC}', region: 'africa', schengen: false },
    { name: "C\u00F4te d'Ivoire", nameDE: 'Elfenbeink\u00FCste', iso: 'CI', flag: '\u{1F1E8}\u{1F1EE}', region: 'africa', schengen: false },
    { name: 'Djibouti', nameDE: 'Dschibuti', iso: 'DJ', flag: '\u{1F1E9}\u{1F1EF}', region: 'africa', schengen: false },
    { name: 'Egypt', nameDE: '\u00C4gypten', iso: 'EG', flag: '\u{1F1EA}\u{1F1EC}', region: 'africa', schengen: false },
    { name: 'Equatorial Guinea', nameDE: '\u00C4quatorialguinea', iso: 'GQ', flag: '\u{1F1EC}\u{1F1F6}', region: 'africa', schengen: false },
    { name: 'Eritrea', nameDE: 'Eritrea', iso: 'ER', flag: '\u{1F1EA}\u{1F1F7}', region: 'africa', schengen: false },
    { name: 'Eswatini', nameDE: 'Eswatini', iso: 'SZ', flag: '\u{1F1F8}\u{1F1FF}', region: 'africa', schengen: false },
    { name: 'Ethiopia', nameDE: '\u00C4thiopien', iso: 'ET', flag: '\u{1F1EA}\u{1F1F9}', region: 'africa', schengen: false },
    { name: 'Gabon', nameDE: 'Gabun', iso: 'GA', flag: '\u{1F1EC}\u{1F1E6}', region: 'africa', schengen: false },
    { name: 'Gambia', nameDE: 'Gambia', iso: 'GM', flag: '\u{1F1EC}\u{1F1F2}', region: 'africa', schengen: false },
    { name: 'Ghana', nameDE: 'Ghana', iso: 'GH', flag: '\u{1F1EC}\u{1F1ED}', region: 'africa', schengen: false },
    { name: 'Guinea', nameDE: 'Guinea', iso: 'GN', flag: '\u{1F1EC}\u{1F1F3}', region: 'africa', schengen: false },
    { name: 'Guinea-Bissau', nameDE: 'Guinea-Bissau', iso: 'GW', flag: '\u{1F1EC}\u{1F1FC}', region: 'africa', schengen: false },
    { name: 'Kenya', nameDE: 'Kenia', iso: 'KE', flag: '\u{1F1F0}\u{1F1EA}', region: 'africa', schengen: false },
    { name: 'Lesotho', nameDE: 'Lesotho', iso: 'LS', flag: '\u{1F1F1}\u{1F1F8}', region: 'africa', schengen: false },
    { name: 'Liberia', nameDE: 'Liberia', iso: 'LR', flag: '\u{1F1F1}\u{1F1F7}', region: 'africa', schengen: false },
    { name: 'Libya', nameDE: 'Libyen', iso: 'LY', flag: '\u{1F1F1}\u{1F1FE}', region: 'africa', schengen: false },
    { name: 'Madagascar', nameDE: 'Madagaskar', iso: 'MG', flag: '\u{1F1F2}\u{1F1EC}', region: 'africa', schengen: false },
    { name: 'Malawi', nameDE: 'Malawi', iso: 'MW', flag: '\u{1F1F2}\u{1F1FC}', region: 'africa', schengen: false },
    { name: 'Mali', nameDE: 'Mali', iso: 'ML', flag: '\u{1F1F2}\u{1F1F1}', region: 'africa', schengen: false },
    { name: 'Mauritania', nameDE: 'Mauretanien', iso: 'MR', flag: '\u{1F1F2}\u{1F1F7}', region: 'africa', schengen: false },
    { name: 'Mauritius', nameDE: 'Mauritius', iso: 'MU', flag: '\u{1F1F2}\u{1F1FA}', region: 'africa', schengen: false },
    { name: 'Morocco', nameDE: 'Marokko', iso: 'MA', flag: '\u{1F1F2}\u{1F1E6}', region: 'africa', schengen: false },
    { name: 'Mozambique', nameDE: 'Mosambik', iso: 'MZ', flag: '\u{1F1F2}\u{1F1FF}', region: 'africa', schengen: false },
    { name: 'Namibia', nameDE: 'Namibia', iso: 'NA', flag: '\u{1F1F3}\u{1F1E6}', region: 'africa', schengen: false },
    { name: 'Niger', nameDE: 'Niger', iso: 'NE', flag: '\u{1F1F3}\u{1F1EA}', region: 'africa', schengen: false },
    { name: 'Nigeria', nameDE: 'Nigeria', iso: 'NG', flag: '\u{1F1F3}\u{1F1EC}', region: 'africa', schengen: false },
    { name: 'Rwanda', nameDE: 'Ruanda', iso: 'RW', flag: '\u{1F1F7}\u{1F1FC}', region: 'africa', schengen: false },
    { name: 'S\u00E3o Tom\u00E9 and Pr\u00EDncipe', nameDE: 'S\u00E3o Tom\u00E9 und Pr\u00EDncipe', iso: 'ST', flag: '\u{1F1F8}\u{1F1F9}', region: 'africa', schengen: false },
    { name: 'Senegal', nameDE: 'Senegal', iso: 'SN', flag: '\u{1F1F8}\u{1F1F3}', region: 'africa', schengen: false },
    { name: 'Seychelles', nameDE: 'Seychellen', iso: 'SC', flag: '\u{1F1F8}\u{1F1E8}', region: 'africa', schengen: false },
    { name: 'Sierra Leone', nameDE: 'Sierra Leone', iso: 'SL', flag: '\u{1F1F8}\u{1F1F1}', region: 'africa', schengen: false },
    { name: 'Somalia', nameDE: 'Somalia', iso: 'SO', flag: '\u{1F1F8}\u{1F1F4}', region: 'africa', schengen: false },
    { name: 'South Africa', nameDE: 'S\u00FCdafrika', iso: 'ZA', flag: '\u{1F1FF}\u{1F1E6}', region: 'africa', schengen: false },
    { name: 'South Sudan', nameDE: 'S\u00FCdsudan', iso: 'SS', flag: '\u{1F1F8}\u{1F1F8}', region: 'africa', schengen: false },
    { name: 'Sudan', nameDE: 'Sudan', iso: 'SD', flag: '\u{1F1F8}\u{1F1E9}', region: 'africa', schengen: false },
    { name: 'Tanzania', nameDE: 'Tansania', iso: 'TZ', flag: '\u{1F1F9}\u{1F1FF}', region: 'africa', schengen: false },
    { name: 'Togo', nameDE: 'Togo', iso: 'TG', flag: '\u{1F1F9}\u{1F1EC}', region: 'africa', schengen: false },
    { name: 'Tunisia', nameDE: 'Tunesien', iso: 'TN', flag: '\u{1F1F9}\u{1F1F3}', region: 'africa', schengen: false },
    { name: 'Uganda', nameDE: 'Uganda', iso: 'UG', flag: '\u{1F1FA}\u{1F1EC}', region: 'africa', schengen: false },
    { name: 'Zambia', nameDE: 'Sambia', iso: 'ZM', flag: '\u{1F1FF}\u{1F1F2}', region: 'africa', schengen: false },
    { name: 'Zimbabwe', nameDE: 'Simbabwe', iso: 'ZW', flag: '\u{1F1FF}\u{1F1FC}', region: 'africa', schengen: false },

    // --- NORDAMERIKA ---
    { name: 'Antigua and Barbuda', nameDE: 'Antigua und Barbuda', iso: 'AG', flag: '\u{1F1E6}\u{1F1EC}', region: 'americas', schengen: false },
    { name: 'Bahamas', nameDE: 'Bahamas', iso: 'BS', flag: '\u{1F1E7}\u{1F1F8}', region: 'americas', schengen: false },
    { name: 'Barbados', nameDE: 'Barbados', iso: 'BB', flag: '\u{1F1E7}\u{1F1E7}', region: 'americas', schengen: false },
    { name: 'Belize', nameDE: 'Belize', iso: 'BZ', flag: '\u{1F1E7}\u{1F1FF}', region: 'americas', schengen: false },
    { name: 'Canada', nameDE: 'Kanada', iso: 'CA', flag: '\u{1F1E8}\u{1F1E6}', region: 'americas', schengen: false },
    { name: 'Costa Rica', nameDE: 'Costa Rica', iso: 'CR', flag: '\u{1F1E8}\u{1F1F7}', region: 'americas', schengen: false },
    { name: 'Cuba', nameDE: 'Kuba', iso: 'CU', flag: '\u{1F1E8}\u{1F1FA}', region: 'americas', schengen: false },
    { name: 'Dominica', nameDE: 'Dominica', iso: 'DM', flag: '\u{1F1E9}\u{1F1F2}', region: 'americas', schengen: false },
    { name: 'Dominican Republic', nameDE: 'Dominikanische Republik', iso: 'DO', flag: '\u{1F1E9}\u{1F1F4}', region: 'americas', schengen: false },
    { name: 'El Salvador', nameDE: 'El Salvador', iso: 'SV', flag: '\u{1F1F8}\u{1F1FB}', region: 'americas', schengen: false },
    { name: 'Grenada', nameDE: 'Grenada', iso: 'GD', flag: '\u{1F1EC}\u{1F1E9}', region: 'americas', schengen: false },
    { name: 'Guatemala', nameDE: 'Guatemala', iso: 'GT', flag: '\u{1F1EC}\u{1F1F9}', region: 'americas', schengen: false },
    { name: 'Haiti', nameDE: 'Haiti', iso: 'HT', flag: '\u{1F1ED}\u{1F1F9}', region: 'americas', schengen: false },
    { name: 'Honduras', nameDE: 'Honduras', iso: 'HN', flag: '\u{1F1ED}\u{1F1F3}', region: 'americas', schengen: false },
    { name: 'Jamaica', nameDE: 'Jamaika', iso: 'JM', flag: '\u{1F1EF}\u{1F1F2}', region: 'americas', schengen: false },
    { name: 'Mexico', nameDE: 'Mexiko', iso: 'MX', flag: '\u{1F1F2}\u{1F1FD}', region: 'americas', schengen: false },
    { name: 'Nicaragua', nameDE: 'Nicaragua', iso: 'NI', flag: '\u{1F1F3}\u{1F1EE}', region: 'americas', schengen: false },
    { name: 'Panama', nameDE: 'Panama', iso: 'PA', flag: '\u{1F1F5}\u{1F1E6}', region: 'americas', schengen: false },
    { name: 'Saint Kitts and Nevis', nameDE: 'St. Kitts und Nevis', iso: 'KN', flag: '\u{1F1F0}\u{1F1F3}', region: 'americas', schengen: false },
    { name: 'Saint Lucia', nameDE: 'St. Lucia', iso: 'LC', flag: '\u{1F1F1}\u{1F1E8}', region: 'americas', schengen: false },
    { name: 'Saint Vincent and the Grenadines', nameDE: 'St. Vincent und die Grenadinen', iso: 'VC', flag: '\u{1F1FB}\u{1F1E8}', region: 'americas', schengen: false },
    { name: 'Trinidad and Tobago', nameDE: 'Trinidad und Tobago', iso: 'TT', flag: '\u{1F1F9}\u{1F1F9}', region: 'americas', schengen: false },
    { name: 'United States', nameDE: 'Vereinigte Staaten', iso: 'US', flag: '\u{1F1FA}\u{1F1F8}', region: 'americas', schengen: false },

    // --- S\u00DCDAMERIKA ---
    { name: 'Argentina', nameDE: 'Argentinien', iso: 'AR', flag: '\u{1F1E6}\u{1F1F7}', region: 'americas', schengen: false },
    { name: 'Bolivia', nameDE: 'Bolivien', iso: 'BO', flag: '\u{1F1E7}\u{1F1F4}', region: 'americas', schengen: false },
    { name: 'Brazil', nameDE: 'Brasilien', iso: 'BR', flag: '\u{1F1E7}\u{1F1F7}', region: 'americas', schengen: false },
    { name: 'Chile', nameDE: 'Chile', iso: 'CL', flag: '\u{1F1E8}\u{1F1F1}', region: 'americas', schengen: false },
    { name: 'Colombia', nameDE: 'Kolumbien', iso: 'CO', flag: '\u{1F1E8}\u{1F1F4}', region: 'americas', schengen: false },
    { name: 'Ecuador', nameDE: 'Ecuador', iso: 'EC', flag: '\u{1F1EA}\u{1F1E8}', region: 'americas', schengen: false },
    { name: 'Guyana', nameDE: 'Guyana', iso: 'GY', flag: '\u{1F1EC}\u{1F1FE}', region: 'americas', schengen: false },
    { name: 'Paraguay', nameDE: 'Paraguay', iso: 'PY', flag: '\u{1F1F5}\u{1F1FE}', region: 'americas', schengen: false },
    { name: 'Peru', nameDE: 'Peru', iso: 'PE', flag: '\u{1F1F5}\u{1F1EA}', region: 'americas', schengen: false },
    { name: 'Suriname', nameDE: 'Suriname', iso: 'SR', flag: '\u{1F1F8}\u{1F1F7}', region: 'americas', schengen: false },
    { name: 'Uruguay', nameDE: 'Uruguay', iso: 'UY', flag: '\u{1F1FA}\u{1F1FE}', region: 'americas', schengen: false },
    { name: 'Venezuela', nameDE: 'Venezuela', iso: 'VE', flag: '\u{1F1FB}\u{1F1EA}', region: 'americas', schengen: false },

    // --- OZEANIEN ---
    { name: 'Australia', nameDE: 'Australien', iso: 'AU', flag: '\u{1F1E6}\u{1F1FA}', region: 'oceania', schengen: false },
    { name: 'Fiji', nameDE: 'Fidschi', iso: 'FJ', flag: '\u{1F1EB}\u{1F1EF}', region: 'oceania', schengen: false },
    { name: 'Kiribati', nameDE: 'Kiribati', iso: 'KI', flag: '\u{1F1F0}\u{1F1EE}', region: 'oceania', schengen: false },
    { name: 'Marshall Islands', nameDE: 'Marshallinseln', iso: 'MH', flag: '\u{1F1F2}\u{1F1ED}', region: 'oceania', schengen: false },
    { name: 'Micronesia', nameDE: 'Mikronesien', iso: 'FM', flag: '\u{1F1EB}\u{1F1F2}', region: 'oceania', schengen: false },
    { name: 'Nauru', nameDE: 'Nauru', iso: 'NR', flag: '\u{1F1F3}\u{1F1F7}', region: 'oceania', schengen: false },
    { name: 'New Zealand', nameDE: 'Neuseeland', iso: 'NZ', flag: '\u{1F1F3}\u{1F1FF}', region: 'oceania', schengen: false },
    { name: 'Palau', nameDE: 'Palau', iso: 'PW', flag: '\u{1F1F5}\u{1F1FC}', region: 'oceania', schengen: false },
    { name: 'Papua New Guinea', nameDE: 'Papua-Neuguinea', iso: 'PG', flag: '\u{1F1F5}\u{1F1EC}', region: 'oceania', schengen: false },
    { name: 'Samoa', nameDE: 'Samoa', iso: 'WS', flag: '\u{1F1FC}\u{1F1F8}', region: 'oceania', schengen: false },
    { name: 'Solomon Islands', nameDE: 'Salomonen', iso: 'SB', flag: '\u{1F1F8}\u{1F1E7}', region: 'oceania', schengen: false },
    { name: 'Tonga', nameDE: 'Tonga', iso: 'TO', flag: '\u{1F1F9}\u{1F1F4}', region: 'oceania', schengen: false },
    { name: 'Tuvalu', nameDE: 'Tuvalu', iso: 'TV', flag: '\u{1F1F9}\u{1F1FB}', region: 'oceania', schengen: false },
    { name: 'Vanuatu', nameDE: 'Vanuatu', iso: 'VU', flag: '\u{1F1FB}\u{1F1FA}', region: 'oceania', schengen: false }
  ];

  // Aliases for common abbreviations
  var aliases = {
    'USA': 'United States',
    'UK': 'United Kingdom',
    'UAE': 'United Arab Emirates',
    'VAE': 'United Arab Emirates',
    'Tschechei': 'Czech Republic',
    'Holland': 'Netherlands',
    'England': 'United Kingdom',
    'Grossbritannien': 'United Kingdom',
    'Gro\u00DFbritannien': 'United Kingdom',
    'Amerika': 'United States',
    'Persien': 'Iran',
    'Burma': 'Myanmar',
    'Elfenbeink\u00FCste': "C\u00F4te d'Ivoire",
    'Bali': 'Indonesia',
    'Dubai': 'United Arab Emirates',
    'Abu Dhabi': 'United Arab Emirates',
    'Phuket': 'Thailand',
    'Bangkok': 'Thailand'
  };

  function search(query) {
    if (!query || query.length < 1) return [];
    var q = query.toLowerCase().trim();

    // Check aliases first (short queries require exact match on alias)
    var aliasMatches = [];
    Object.keys(aliases).forEach(function (alias) {
      var aliasLower = alias.toLowerCase();
      var matches = q.length <= 3
        ? aliasLower === q
        : aliasLower.indexOf(q) !== -1;
      if (matches) {
        var country = getByName(aliases[alias]);
        if (country && aliasMatches.indexOf(country) === -1) {
          aliasMatches.push(country);
        }
      }
    });

    var results = countries.filter(function (c) {
      return c.name.toLowerCase().indexOf(q) !== -1 ||
             c.nameDE.toLowerCase().indexOf(q) !== -1 ||
             c.iso.toLowerCase() === q;
    });

    // Build a set of alias-matched ISOs for priority sorting
    var aliasISOs = {};
    aliasMatches.forEach(function (am) { aliasISOs[am.iso] = true; });

    // Merge alias matches, avoid duplicates
    aliasMatches.forEach(function (am) {
      var isDuplicate = results.some(function (r) { return r.iso === am.iso; });
      if (!isDuplicate) {
        results.push(am);
      }
    });

    // Sort: alias matches first, then exact nameDE start, then exact name start, then rest
    results.sort(function (a, b) {
      var aAlias = aliasISOs[a.iso] ? 0 : 1;
      var bAlias = aliasISOs[b.iso] ? 0 : 1;
      if (aAlias !== bAlias) return aAlias - bAlias;
      var aStartDE = a.nameDE.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      var bStartDE = b.nameDE.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      if (aStartDE !== bStartDE) return aStartDE - bStartDE;
      var aStart = a.name.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      var bStart = b.name.toLowerCase().indexOf(q) === 0 ? 0 : 1;
      if (aStart !== bStart) return aStart - bStart;
      return a.nameDE.localeCompare(b.nameDE);
    });

    return results;
  }

  function getByName(name) {
    if (!name) return null;
    var q = name.toLowerCase().trim();
    return countries.find(function (c) {
      return c.name.toLowerCase() === q || c.nameDE.toLowerCase() === q;
    }) || null;
  }

  function getFlag(name) {
    var c = getByName(name);
    if (c) return c.flag;
    // Try aliases
    var q = name.trim();
    var aliasKey = Object.keys(aliases).find(function (a) {
      return a.toLowerCase() === q.toLowerCase();
    });
    if (aliasKey) {
      c = getByName(aliases[aliasKey]);
      if (c) return c.flag;
    }
    return '';
  }

  function isSchengen(name) {
    var c = getByName(name);
    return c ? c.schengen : false;
  }

  function getSchengenCountries() {
    return countries.filter(function (c) { return c.schengen; });
  }

  return {
    countries: countries,
    search: search,
    getByName: getByName,
    getFlag: getFlag,
    isSchengen: isSchengen,
    getSchengenCountries: getSchengenCountries
  };
})();

// Datos de servicios de emergencia de Quito y grafo vial
// Fuente: proyecto x3d_classifier - datos reales de la ciudad

// Servicios de emergencia con ubicacion real
export const EMERGENCIA = {
  policia: [
    { id: 'upc01', nombre: 'UPC La Luz', lat: -0.14630, lng: -78.47933, direccion: 'Jacinto Jijon y Caamano S/N' },
    { id: 'upc02', nombre: 'UPC La Floresta', lat: -0.21326, lng: -78.48368, direccion: 'C. E16, La Floresta' },
    { id: 'upc03', nombre: 'UPC de El Dorado', lat: -0.21798, lng: -78.49308, direccion: 'Solano' },
    { id: 'upc04', nombre: 'UPC La Pulida', lat: -0.13950, lng: -78.50359, direccion: 'Sector La Pulida' },
    { id: 'upc05', nombre: 'UPC Ruminahui Alta', lat: -0.12627, lng: -78.48566, direccion: 'Nagola' },
    { id: 'upc06', nombre: 'Distrito Policia La Delicia', lat: -0.12686, lng: -78.48340, direccion: 'Av. del Maestro' },
    { id: 'upc07', nombre: 'UPC Rio Coca', lat: -0.16321, lng: -78.47388, direccion: 'Av. Rio Coca E5 255' },
    { id: 'upc08', nombre: 'UPC Flavio Alfaro', lat: -0.12350, lng: -78.49730, direccion: 'Flavio Alfaro' },
    { id: 'upc09', nombre: 'UPC Quito Norte', lat: -0.12579, lng: -78.49835, direccion: 'Cieza de Leon' },
    { id: 'upc10', nombre: 'UPC Comite del Pueblo 1', lat: -0.11961, lng: -78.46451, direccion: 'Cesar Endara' },
    { id: 'upc11', nombre: 'UPC Carolina', lat: -0.18311, lng: -78.48631, direccion: 'Av. Rio Amazonas' },
    { id: 'upc12', nombre: 'UPC Ponceano Alto', lat: -0.10070, lng: -78.48091, direccion: 'Ponceano' },
    { id: 'upc13', nombre: 'UPC Cotocollao', lat: -0.11432, lng: -78.49843, direccion: 'Santa Teresa 8-23' },
    { id: 'upc14', nombre: 'UPC Las Casas', lat: -0.18599, lng: -78.51002, direccion: 'Sector Las Casas' },
    { id: 'upc15', nombre: 'UPC San Carlos', lat: -0.12948, lng: -78.50299, direccion: 'Sector San Carlos' }
  ],
  bomberos: [
    { id: 'bomb01', nombre: 'Bomberos Estacion N 21', lat: -0.13583, lng: -78.48784, direccion: 'Rafael Aulestia', telefono: '(02) 256-1616' },
    { id: 'bomb02', nombre: 'Bomberos Juan Leon Mera', lat: -0.20413, lng: -78.49307, direccion: 'Juan Leon Mera 612', telefono: '(02) 256-1616' },
    { id: 'bomb03', nombre: 'Bomberos Carcelen', lat: -0.08905, lng: -78.47111, direccion: 'Francisco Ruiz', telefono: '(02) 256-1616' },
    { id: 'bomb04', nombre: 'Bomberos Estacion N 24', lat: -0.28564, lng: -78.47674, direccion: 'Conocoto', telefono: '(02) 256-1616' }
  ],
  ecu911: [
    { id: 'ecu911', nombre: 'ECU 911 Quito', lat: -0.21996, lng: -78.49881, direccion: 'Centro de Quito', telefono: '911' }
  ],
  hospitales: [
    { id: 'hosp01', nombre: 'Hospital Capital', lat: -0.16131, lng: -78.47610, direccion: 'Av. 6 de Diciembre', telefono: '(02) 226-0000' },
    { id: 'hosp02', nombre: 'Clinica El Batan', lat: -0.16544, lng: -78.47564, direccion: 'Av. 6 de Diciembre 4311', telefono: '(02) 246-2143' },
    { id: 'hosp03', nombre: 'Clinica La Luz', lat: -0.14790, lng: -78.47557, direccion: 'Av. 6 de Diciembre N48-201', telefono: '(02) 226-0282' },
    { id: 'hosp04', nombre: 'Cruz Roja Cochapata', lat: -0.17046, lng: -78.47515, direccion: 'Cochapata E11-10', telefono: '(02) 258-2482' },
    { id: 'hosp05', nombre: 'Hospital Vozandes', lat: -0.17281, lng: -78.48945, direccion: 'Veracruz N-37', telefono: '(02) 397-1000' },
    { id: 'hosp06', nombre: 'Hospital Metropolitano', lat: -0.18438, lng: -78.50370, direccion: 'Av. Mariana de Jesus', telefono: '(02) 399-8000' },
    { id: 'hosp07', nombre: 'Hospital Adventista', lat: -0.19150, lng: -78.49296, direccion: 'Av. 10 de Agosto', telefono: '(02) 256-0308' },
    { id: 'hosp08', nombre: 'Hospital Clinicas Pichincha', lat: -0.20193, lng: -78.49549, direccion: 'Gral. Ulpiano Paez', telefono: '(02) 299-8700' },
    { id: 'hosp09', nombre: 'Clinica Pichincha', lat: -0.20194, lng: -78.49548, direccion: 'Ulpiano Paez 250', telefono: '(02) 299-8700' },
    { id: 'hosp10', nombre: 'Clinica Moderna', lat: -0.19650, lng: -78.49491, direccion: 'Av. Francisco E1-15', telefono: '(02) 290-4670' }
  ]
};

// Nodos del grafo vial de Quito (intersecciones)
export const NODOS_GRAFO = {
  '6d_ponc': { lat: -0.1010, lng: -78.4760 },
  '6d_comite': { lat: -0.1150, lng: -78.4740 },
  '6d_bicent': { lat: -0.1350, lng: -78.4760 },
  '6d_luz': { lat: -0.1463, lng: -78.4760 },
  '6d_granda': { lat: -0.1530, lng: -78.4760 },
  '6d_rcoca': { lat: -0.1632, lng: -78.4760 },
  '6d_cam': { lat: -0.1693, lng: -78.4764 },
  '6d_batan': { lat: -0.1755, lng: -78.4760 },
  '6d_carol': { lat: -0.1830, lng: -78.4770 },
  '6d_colon': { lat: -0.1950, lng: -78.4780 },
  '6d_patria': { lat: -0.2050, lng: -78.4790 },
  '6d_flore': { lat: -0.2133, lng: -78.4800 },
  '6d_dorado': { lat: -0.2180, lng: -78.4810 },
  'amz_rcoca': { lat: -0.1632, lng: -78.4840 },
  'amz_nnuu': { lat: -0.1700, lng: -78.4860 },
  'amz_carol': { lat: -0.1831, lng: -78.4863 },
  'amz_colon': { lat: -0.1950, lng: -78.4880 },
  'amz_patria': { lat: -0.2050, lng: -78.4900 },
  '10a_bicent': { lat: -0.1358, lng: -78.4950 },
  '10a_rcoca': { lat: -0.1632, lng: -78.4940 },
  '10a_nnuu': { lat: -0.1700, lng: -78.4960 },
  '10a_mjesus': { lat: -0.1840, lng: -78.4980 },
  '10a_colon': { lat: -0.1950, lng: -78.4990 },
  '10a_patria': { lat: -0.2050, lng: -78.5000 },
  'ea_comite': { lat: -0.1196, lng: -78.4645 },
  'ea_bicent': { lat: -0.1358, lng: -78.4680 },
  'ea_rcoca': { lat: -0.1632, lng: -78.4700 },
  'ea_nnuu': { lat: -0.1700, lng: -78.4710 },
  'n_ponceano': { lat: -0.1007, lng: -78.4810 },
  'n_cotoc': { lat: -0.1143, lng: -78.4984 },
  'n_scarlos': { lat: -0.1295, lng: -78.5030 },
  'n_delicia': { lat: -0.1269, lng: -78.4834 },
  'n_flavio': { lat: -0.1235, lng: -78.4973 },
  'n_qnorte': { lat: -0.1258, lng: -78.4984 },
  'c_lascasas': { lat: -0.1860, lng: -78.5100 },
  'c_metro': { lat: -0.1844, lng: -78.5037 },
  'c_pulida': { lat: -0.1395, lng: -78.5036 },
  'c_rumi': { lat: -0.1263, lng: -78.4857 },
  'ecu911': { lat: -0.2200, lng: -78.4988 }
};

// Aristas del grafo vial (conexiones entre nodos)
export const ARISTAS_GRAFO = [
  ['6d_ponc', '6d_comite'], ['6d_comite', '6d_bicent'], ['6d_bicent', '6d_luz'],
  ['6d_luz', '6d_granda'], ['6d_granda', '6d_rcoca'], ['6d_rcoca', '6d_cam'],
  ['6d_cam', '6d_batan'], ['6d_batan', '6d_carol'], ['6d_carol', '6d_colon'],
  ['6d_colon', '6d_patria'], ['6d_patria', '6d_flore'], ['6d_flore', '6d_dorado'],
  ['amz_rcoca', 'amz_nnuu'], ['amz_nnuu', 'amz_carol'], ['amz_carol', 'amz_colon'],
  ['amz_colon', 'amz_patria'],
  ['10a_bicent', '10a_rcoca'], ['10a_rcoca', '10a_nnuu'], ['10a_nnuu', '10a_mjesus'],
  ['10a_mjesus', '10a_colon'], ['10a_colon', '10a_patria'],
  ['ea_comite', 'ea_bicent'], ['ea_bicent', 'ea_rcoca'], ['ea_rcoca', 'ea_nnuu'],
  ['ea_rcoca', '6d_rcoca'], ['6d_rcoca', 'amz_rcoca'], ['amz_rcoca', '10a_rcoca'],
  ['ea_nnuu', '6d_cam'], ['6d_cam', 'amz_nnuu'], ['amz_nnuu', '10a_nnuu'],
  ['6d_carol', 'amz_carol'], ['amz_carol', '10a_mjesus'], ['10a_mjesus', 'c_metro'], ['c_metro', 'c_lascasas'],
  ['6d_colon', 'amz_colon'], ['amz_colon', '10a_colon'],
  ['6d_patria', 'amz_patria'], ['amz_patria', '10a_patria'],
  ['ea_bicent', '6d_bicent'], ['6d_bicent', '10a_bicent'],
  ['6d_ponc', 'n_ponceano'], ['n_ponceano', 'n_delicia'], ['n_delicia', 'c_rumi'],
  ['c_rumi', '6d_bicent'], ['n_delicia', 'n_flavio'], ['n_flavio', 'n_qnorte'],
  ['n_qnorte', 'n_cotoc'], ['n_cotoc', 'n_scarlos'], ['n_scarlos', 'c_pulida'],
  ['c_pulida', '10a_bicent'], ['n_qnorte', 'n_scarlos'],
  ['ea_comite', '6d_comite'], ['6d_comite', 'n_delicia'],
  ['6d_dorado', 'ecu911'], ['amz_patria', 'ecu911'], ['10a_patria', 'ecu911'],
  ['6d_flore', 'ecu911'], ['6d_luz', 'amz_rcoca'], ['6d_batan', 'amz_nnuu'],
  ['10a_bicent', 'n_scarlos'], ['10a_bicent', 'c_pulida']
];

var locations = {
    'Buenos Aires': [
                     '-34.60799096781689, -58.37426551063541',
                     '-34.62077280270602, -58.37052269655776',
                     '-34.6648173858385, -58.38058100099205',
                     '-34.607904519406205, -58.38774777025596',
                     '-34.63085393578468, -58.35996312540375',
                     '-34.63348133058524, -58.38704287832326',
                     '-34.64781141779835, -58.37058412887976',
                     '-34.65433214764992, -58.35904501018016'
                     ],
    'Vienna': [
               '48.23148181855913, 16.362953906441383',
               '48.21360549579682, 16.378194465894484',
               '48.22043678965347, 16.380511294297968',
               '48.231221161366776, 16.3633575216034',
               '48.1973327595068, 16.368787583219145',
               '48.208013415331536, 16.38379917751857',
               '48.22184353971297, 16.36714900380807'
               ],
     'La Paz': [
                '-16.507629316738903, -68.16310769273058',
                '-16.50337084377004, -68.13670940854608',
                '-16.508501432863355, -68.13560832918539',
                '-16.506396174473934, -68.1498984554604',
                '-16.50518920557637, -68.13907179857338',
                '-16.518146633643624, -68.1540060183668',
                '-16.488885875939268, -68.16666306684711',
                '-16.4926391649213, -68.14825503465119',
                '-16.480456646149978, -68.1525835967929'
                ],
     'Brasilia': [
                  '-15.786179192727651, -47.90865964574483',
                  '-15.79033280618982, -47.91263877072899',
                  '-15.789268383816255, -47.9060180995083',
                  '-15.776880137615636, -47.89646004928503',
                  '-15.789279718353322, -47.91890307914389'
                  ],
     'Montreal': [
                  '45.524173985833315, -73.5651468230264',
                  '45.57779143750476, -73.58002963039469',
                  '45.4700768980569, -73.57163620200588'
                  ],
     'Toronto': [
                 '43.64740213623083, -79.3926056629946',
                 '43.669273272290084, -79.38616509405456',
                 '43.67609786067441, -79.38079839953929',
                 '43.66185265067742, -79.38902066587364',
                 '43.664194211471745, -79.38442922601239',
                 '43.66669442396112, -79.37032381060503',
                 '43.64163993264159, -79.3706937724414',
                 '43.65050316605859, -79.39419571882257',
                 '43.65188998648359, -79.39050166685011',
                 '43.64785931683469, -79.39717373852021'
                 ],
      'Santiago': [
                   '-33.61609857155833, -70.64096478588337',
                   '-33.495364, -70.639349',
                   '-33.483410, -70.632826',
                   '-33.503022, -70.656000',
                   '-33.495793, -70.645915'
                   ],
      'Peking': [
                 '39.931152, 116.396352',
                 '39.932123, 116.409141',
                 '39.931498, 116.414591',
                 '39.959587, 116.429118',
                 '39.943533, 116.379250',
                 '39.942752, 116.376031',
                 '39.951413, 116.384448',
                 '39.955151, 116.398469',
                 '39.957988, 116.361948',
                 '39.983708, 116.423060',
                 '39.982404, 116.309247',
                 '39.957408, 116.331048',
                 '39.992967, 116.358045'
                 ],
      'Bogota': [
                 '4.602169092341897, -74.08937442945899',
                 '4.566892550296599, -74.08774916070685',
                 '4.57538050996606, -74.08927647322618',
                 '4.602651589121941, -74.09206725836962',
                 '4.694549239466859, -74.09569294728183',
                 '4.635118789559249, -74.07208593659662',
                 '4.682295852396032, -74.0848971983934',
                 '4.645793798648794, -74.09262800068831',
                 '4.601306865124887, -74.08753741609338'
                 ],
      'Quito': [
                '-0.19662577539678633, -78.49468665933541',
                '-0.19325781282265977, -78.50978792985954',
                '-0.1866022914475686, -78.49959122663107',
                '-0.18665400644049152, -78.51089290095305',
                '-0.199894, -78.487400'
                ],
      'London': [
                 '51.529837361685, -0.1049207603995409',
                 '51.529757, -0.086639',
                 '51.527301, -0.114963',
                 '51.534082, -0.101316',
                 '51.523243, -0.120542',
                 '51.526660, -0.083892',
                 '51.529063, -0.129726',
                 '51.539901, -0.110843',
                 '51.533441, -0.128524',
                 '51.520786, -0.093419'
                 ],
     'Manchester': [
                    '53.477048011459, -2.2350976941951433',
                    '53.478574, -2.250891',
                    '53.478140, -2.231150',
                    '53.481563, -2.243295',
                    '53.483861, -2.228661',
                    '53.486057, -2.258444',
                    '53.471959, -2.261234',
                    '53.476531, -2.232094',
                    '53.482431, -2.230678',
                    '53.480720, -2.273293'
                    ],
    'Paris': [ 
              '48.858602, 2.347882',
              '48.851826, 2.316510',
              '48.847957, 2.342002',
              '48.858009, 2.307541',
              '48.870064, 2.333762',
              '48.871504, 2.343075',
              '48.868004, 2.308013',
              '48.857445, 2.354104',
              '48.870064, 2.347882',
              '48.849199, 2.339041'
             ],
    'Berlin': [
               '52.51733537167906, 13.39629312179468',
               '52.523511, 13.385221',
               '52.513666, 13.380200',
               '52.517348, 13.415777',
               '52.525261, 13.402130',
               '52.521031, 13.373934',
               '52.510140, 13.403803',
               '52.519568, 13.370844',
               '52.518941, 13.421313',
               '52.504420, 13.392903'
             ],
    'Athens': [
               '37.96027048193241, 23.74310192065472',
               '37.955144, 23.726236',
               '37.964348, 23.731772',
               '37.959543, 23.761083',
               '37.968035, 23.752715',
               '37.951354, 23.724047',
               '37.948613, 23.751857',
               '37.966987, 23.770053',
               '37.965058, 23.722889',
               '37.941844, 23.735077'
               ],
    'Hong Kong': [
                '22.278345, 114.153020',
                '22.274314, 114.169671',
                '22.280767, 114.176538',
                '22.279159, 114.150424',
                '22.275605, 114.152656',
                '22.276895, 114.176495',
                '22.281720, 114.174371',
                '22.277610, 114.180787',
                '22.279497, 114.185078',
                '22.276776, 114.186129'
                  ],
    'Bombay': [
               '18.956333, 72.826263',
               '18.961366, 72.831112',
               '18.937865, 72.835275',
               '18.959905, 72.844502',
               '18.964461, 72.810963',
               '18.972699, 72.827829',
               '18.974120, 72.809762',
               '18.953867, 72.798904',
               '18.970995, 72.839502',
               '18.980897, 72.830962'
               ],
    'Jakarta': [
               '-6.183782, 106.815896',
               '-6.192491, 106.820037',
               '-6.176278, 106.832954',
               '-6.179606, 106.798365',
               '-6.196203, 106.795661',
               '-6.193686, 106.838619',
               '-6.169878, 106.826345',
               '-6.179393, 106.789309',
               '-6.189376, 106.783387',
               '-6.202005, 106.789824'
                ],
    'Dublin': [
               '53.341073, -6.257089',
               '53.326106, -6.260437',
               '53.337280, -6.278290',
               '53.329438, -6.228079',
               '53.339228, -6.279920',
               '53.345684, -6.243786',
               '53.335384, -6.283182',
               '53.349117, -6.270651',
               '53.355214, -6.234602',
               '53.355880, -6.292280'
               ],
    'Jerusalem': [
               '31.766766, 35.181310',
               '31.774975, 35.212939',
               '31.771473, 35.191610',
               '31.760235, 35.223281',
               '31.780083, 35.211222',
               '31.776069, 35.186417',
               '31.776069, 35.222337',
               '31.757534, 35.210535',
               '31.751750, 35.192210',
               '31.763865, 35.213282'
                  ],
    'Rome': [
             '41.899333, 12.517841',
             '41.888631, 12.475226',
             '41.883519, 12.521875',
             '41.879940, 12.477243',
             '41.896458, 12.472008'
             ],
    'Tokyo': [
              '35.74860963810567, 139.78527819054878',
              '35.748758, 139.772811',
              '35.752519, 139.797638',
              '35.743289, 139.782188',
              '35.743254, 139.774421'
              ],
    'Osaka': [
              '34.677552, 135.494232',
              '34.680269, 135.517986',
              '34.670705, 135.518522',
              '34.672011, 135.504296',
              '34.666222, 135.508373'
              ],
    'Johor Bahru': [
              '1.492678, 103.773007',
              '1.478178, 103.756957',
              '1.498641, 103.787641',
              '1.494952, 103.752279',
              '1.495767, 103.739619'
                    ],
    'Kuala Lumpur': [
              '3.167200508403056, 101.72402923073012',
              '3.174164, 101.710339',
              '3.163794, 101.698838',
              '3.174506, 101.749092',
              '3.155053, 101.740723'
                     ],
    'Kuching': [
              '1.546418, 110.353361',
              '1.547104, 110.334822',
              '1.540583, 110.375763',
              '1.568353, 110.392661',
              '1.565736, 110.331592'
                ],
    'Malaca': [
              '2.371412, 102.225616',
              '2.378144, 102.227676',
              '2.361764, 102.230809',
              '2.364594, 102.209695',
              '2.378144, 102.206090'
               ],
   'George Town': [
              '5.273285, 100.466505',
              '5.281874, 100.479808',
              '5.266277, 100.478478',
              '5.295976, 100.472556',
              '5.284011, 100.495086'
                     ],
   'Ipoh': [
            '4.596924, 101.061664',
            '4.598635, 101.088099',
            '4.603896, 101.097198',
            '4.603169, 101.110888',
            '4.582123, 101.087499'
            ],
   'Mexico City': [
            '19.441347, -99.154203',
            '19.434508, -99.174373',
            '19.431473, -99.131157',
            '19.451909, -99.153688',
            '19.451059, -99.188449'
                   ],
   'Abuja': [
            '9.078590, 7.466759',
            '9.082616, 7.499332',
            '9.097321, 7.479290',
            '9.070920, 7.477359',
            '9.069945, 7.465257'
             ],
   'Oslo': [
            '59.870188, 10.819534',
            '59.870899, 10.789021',
            '59.871459, 10.834125',
            '59.860363, 10.818847',
            '59.877554, 10.802067'
            ],
   'Lima': [
            '-12.086221, -77.020294',
            '-12.094487, -77.068359',
            '-12.081185, -77.046729',
            '-12.095788, -77.044240',
            '-12.106908, -77.032825'
            ],
   'Cebu': [
            '10.313220, 123.907344',
            '10.301777, 123.905413',
            '10.313642, 123.917815',
            '10.301270, 123.880865',
            '10.293501, 123.898761'
            ],
   'Davao': [
            '7.102425432742913, 125.62634656612518',
            '7.104789, 125.608322',
            '7.114626, 125.642139',
            '7.089160, 125.628149',
            '7.102106, 125.601713'
             ],
   'Manila': [
            '14.619730, 120.976351',
            '14.626955, 120.991458',
            '14.632478, 120.974120',
            '14.608269, 120.973648',
            '14.612297, 120.993432'
              ],
    'Zamboanga': [
             '6.934932, 122.073305',
             '6.934847, 122.094591',
             '6.932376, 122.061933',
             '6.948394, 122.073863',
             '6.930629, 122.062533'
                  ],
    'Bucharest': [
             '44.438361, 26.125449',
             '44.435358, 26.079916',
             '44.432232, 26.112789',
             '44.449636, 26.103219',
             '44.445193, 26.074380'
               ],
    'Warsaw': [
             '52.252526, 20.996697',
             '52.261326, 21.025450',
             '52.249190, 21.031330',
             '52.244775, 20.994165',
             '52.260696, 21.044033'
               ],
    'Moscow': [
             '55.758175, 37.600946',
             '55.757402, 37.643732',
             '55.755132, 37.595410',
             '55.746920, 37.635278',
             '55.764622, 37.615794'
               ],
    'Riyadh': [
              '24.635626, 46.768798',
              '24.649122, 46.789269',
              '24.632661, 46.792402',
              '24.634144, 46.744208',
              '24.629501, 46.760816'
              ],
    'Singapore': [
              '1.305771, 103.825195',
              '1.311992, 103.863690',
              '1.286335, 103.844035',
              '1.301309, 103.818972',
              '1.318285, 103.856762'
                  ],
    'Seoul': [
             '37.513046, 127.024891',
             '37.511276, 127.056691',
             '37.528499, 127.042400',
             '37.509778, 127.042486',
             '37.509097, 127.017295'
              ],
    'Barcelona': [
             '41.399233, 2.164818',
             '41.384101, 2.135121',
             '41.401550, 2.165934',
             '41.404898, 2.205759',
             '41.376888, 2.168423'
                  ],
    'Madrid': [
             '40.427596, -3.681247',
             '40.411652, -3.713004',
             '40.429491, -3.698499',
             '40.425080, -3.726351',
             '40.412567, -3.695495'
               ],
    'Valencia': [
             '39.481474, -0.403690',
             '39.473656, -0.372147',
             '39.486012, -0.373134',
             '39.471536, -0.401373',
             '39.469052, -0.409999'
                 ],
    'Taipei': [
             '25.025339, 121.517372',
             '25.045248, 121.577110',
             '25.050244, 121.534023',
             '25.053121, 121.555051',
             '25.057008, 121.522436'
               ],
    'Bangkok': [
             '13.726686, 100.521114',
             '13.726811, 100.499442',
             '13.740776, 100.508283',
             '13.723767, 100.501030',
             '13.728562, 100.493520'
                ],
    'Nonthaburi': [
              '13.859729, 100.505157',
              '13.860937, 100.525156',
              '13.864896, 100.511337',
              '13.858563, 100.513440',
              '13.861062, 100.519662'
                   ],
    'Montevideo': [
               '-34.872623, -56.179398',
               '-34.872623, -56.157512',
               '-34.877869, -56.181458',
               '-34.877411, -56.157683',
               '-34.859384, -56.170129'
                   ],
    'Atlanta': [
              '33.761231, -84.405194',
              '33.757485, -84.437381',
              '33.770186, -84.414678',
              '33.751098, -84.422017',
              '33.753810, -84.402104'
                ],
    'Boston': [
              '42.365134, -71.033518',
              '42.351086, -71.043904',
              '42.335638, -71.035364',
              '42.337002, -71.043689',
              '42.333132, -71.031072'
               ],
    'Chicago': [
              '41.835636, -87.680472',
              '41.844492, -87.703732',
              '41.834165, -87.665623',
              '41.830775, -87.685922',
              '41.850310, -87.678155'
                ],
    'Los Angeles': [
               '34.051575, -118.266195',
               '34.054277, -118.246625',
               '34.039556, -118.240102',
               '34.041547, -118.261989',
               '34.055913, -118.243364'
                    ],
    'New York': [
               '40.762769, -73.973646',
               '40.648513, -73.782072',
               '40.681587, -73.953046',
               '40.769009, -73.876485',
               '40.744563, -73.994932'
                 ],
    'San Francisco': [
               '37.774596, -122.415196',
               '37.764114, -122.435151',
               '37.777276, -122.443005',
               '37.764114, -122.449485',
               '37.781245, -122.420088'
                      ],
    'Washington': [
               '38.911152, -77.037338',
               '38.914692, -77.017082',
               '38.900766, -77.023176',
               '38.911887, -77.006181',
               '38.916829, -77.016910'
                   ],
    'Phoenix': [
               '33.541663, -112.080900',
               '33.535260, -112.055409',
               '33.531254, -112.086265',
               '33.532685, -112.047555',
               '33.550212, -112.054722'
                ],
    'Caracas': [
               '10.469194, -66.813462',
               '10.475988, -66.807110',
               '10.463159, -66.827495',
               '10.464467, -66.814148',
               '10.478224, -66.817367'
                ],
    'Hanoi': [
              '21.022637, 105.848723',
              '21.021756, 105.822287',
              '21.029928, 105.834647',
              '21.033813, 105.836278',
              '21.014024, 105.833746'
              ],
    'Ho Chi Minh': [
              '10.781876, 106.679057',
              '10.773655, 106.678499',
              '10.785080, 106.696223',
              '10.779642, 106.696995',
              '10.783984, 106.669444'
                    ],
    'Hai Phong': [
              '20.859178, 106.664679',
              '20.860862, 106.667597',
              '20.856852, 106.677296',
              '20.851799, 106.664808',
              '20.861985, 106.695621'
                  ]


};

module.exports = locations;

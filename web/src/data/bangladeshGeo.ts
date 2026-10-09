export interface DistrictData {
  name: string;
  thanas: string[];
}

export interface DivisionData {
  name: string;
  districts: DistrictData[];
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    name: 'Dhaka',
    districts: [
      {
        name: 'Dhaka',
        thanas: [
          'Dhanmondi',
          'Gulshan',
          'Banani',
          'Uttara',
          'Mirpur',
          'Mohammadpur',
          'Motijheel',
          'Tejgaon',
          'Badda',
          'Khilgaon',
          'Paltan',
          'Ramna',
          'Shahbagh',
          'Lalbagh',
          'Sutrapur',
          'Kotwali',
          'Wari',
          'Jatrabari',
          'Demra',
          'Kadamtali',
          'Shyampur',
          'Kamrangirchar',
          'Hazaribagh',
          'New Market',
          'Kalabagan',
          'Cantonment',
          'Kafrul',
          'Pallabi',
          'Rupnagar',
          'Darus Salam',
          'Shah Ali',
          'Vashantek',
          'Bhatara',
          'Khilkhet',
          'Dakshinkhan',
          'Uttarkhan',
          'Turag',
          'Airport',
          'Rampura',
          'Sabujbagh',
          'Mugda',
          'Gandaria',
          'Chawkbazar',
          'Bangshal',
          'Keraniganj',
          'Savar',
          'Dhamrai',
          'Dohar',
          'Nawabganj',
        ],
      },
      {
        name: 'Gazipur',
        thanas: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur'],
      },
      {
        name: 'Narayanganj',
        thanas: ['Narayanganj Sadar', 'Bandar', 'Fatullah', 'Siddhirganj', 'Araihazar', 'Sonargaon', 'Rupganj'],
      },
      {
        name: 'Tangail',
        thanas: ['Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Gopalpur', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Dhanbari', 'Kalihati'],
      },
      {
        name: 'Kishoreganj',
        thanas: ['Kishoreganj Sadar', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'],
      },
      {
        name: 'Manikganj',
        thanas: ['Manikganj Sadar', 'Singair', 'Shivalaya', 'Saturia', 'Harirampur', 'Ghior', 'Daulatpur'],
      },
      {
        name: 'Munshiganj',
        thanas: ['Munshiganj Sadar', 'Sreenagar', 'Sirajdikhan', 'Louhajang', 'Tongibari', 'Gazaria'],
      },
      {
        name: 'Narsingdi',
        thanas: ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur'],
      },
      {
        name: 'Faridpur',
        thanas: ['Faridpur Sadar', 'Boalmari', 'Alfadanga', 'Madhukhali', 'Bhanga', 'Nagarkanda', 'Charbhadrasan', 'Sadarpur', 'Saltha'],
      },
      {
        name: 'Gopalganj',
        thanas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'],
      },
      {
        name: 'Madaripur',
        thanas: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar', 'Dasar'],
      },
      {
        name: 'Rajbari',
        thanas: ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Baliakandi', 'Kalukhali'],
      },
      {
        name: 'Shariatpur',
        thanas: ['Shariatpur Sadar', 'Damudya', 'Naria', 'Jajira', 'Bhedarganj', 'Gosairhat'],
      },
    ],
  },
  {
    name: 'Chattogram',
    districts: [
      {
        name: 'Chattogram',
        thanas: [
          'Kotwali',
          'Panchlaish',
          'Pahartali',
          'Halishahar',
          'Double Mooring',
          'Patenga',
          'Bandar',
          'Chandgaon',
          'Khulshi',
          'Bakalia',
          'Bayazid',
          'Karnaphuli',
          'Anwara',
          'Banshkhali',
          'Boalkhali',
          'Chandanaish',
          'Fatikchhari',
          'Hathazari',
          'Lohagara',
          'Mirsharai',
          'Patiya',
          'Rangunia',
          'Raozan',
          'Sandwip',
          'Satkania',
          'Sitakunda',
        ],
      },
      {
        name: "Cox's Bazar",
        thanas: ["Cox's Bazar Sadar", 'Chakaria', 'Maheshkhali', 'Teknaf', 'Ukhiya', 'Ramu', 'Kutubdia', 'Pekua', 'Eidgaon'],
      },
      {
        name: 'Cumilla',
        thanas: [
          'Cumilla Adarsha Sadar',
          'Cumilla Sadar Dakshin',
          'Barura',
          'Brahmanpara',
          'Burichang',
          'Chandina',
          'Chauddagram',
          'Daudkandi',
          'Debidwar',
          'Homna',
          'Laksam',
          'Lalmai',
          'Meghna',
          'Monohargonj',
          'Muradnagar',
          'Nangalkot',
          'Titas',
        ],
      },
      {
        name: 'Feni',
        thanas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Sonagazi', 'Fulgazi'],
      },
      {
        name: 'Brahmanbaria',
        thanas: ['Brahmanbaria Sadar', 'Ashuganj', 'Bancharampur', 'Bijoynagar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail', 'Akhaura'],
      },
      {
        name: 'Chandpur',
        thanas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Hajiganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'],
      },
      {
        name: 'Noakhali',
        thanas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat'],
      },
      {
        name: 'Lakshmipur',
        thanas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'],
      },
      {
        name: 'Rangamati',
        thanas: ['Rangamati Sadar', 'Baghaichhari', 'Barkal', 'Belaichhari', 'Juraichhari', 'Kaptai', 'Kawkhali', 'Langadu', 'Naniarchar', 'Rajasthali'],
      },
      {
        name: 'Khagrachhari',
        thanas: ['Khagrachhari Sadar', 'Dighinala', 'Laksmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh', 'Guimara'],
      },
      {
        name: 'Bandarban',
        thanas: ['Bandarban Sadar', 'Alikadam', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'],
      },
    ],
  },
  {
    name: 'Rajshahi',
    districts: [
      {
        name: 'Rajshahi',
        thanas: [
          'Boalia',
          'Motihar',
          'Rajpara',
          'Shah Makhdum',
          'Chandrima',
          'Kashiadanga',
          'Katakhali',
          'Paba',
          'Bagha',
          'Bagmara',
          'Charghat',
          'Durgapur',
          'Godagari',
          'Mohanpur',
          'Puthia',
          'Tanore',
        ],
      },
      {
        name: 'Bogura',
        thanas: ['Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sahajanpur', 'Sariakandi', 'Sherpur', 'Shibganj', 'Sonatola'],
      },
      {
        name: 'Pabna',
        thanas: ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'],
      },
      {
        name: 'Sirajganj',
        thanas: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara'],
      },
      {
        name: 'Naogaon',
        thanas: ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mohadevpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'],
      },
      {
        name: 'Natore',
        thanas: ['Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga'],
      },
      {
        name: 'Joypurhat',
        thanas: ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'],
      },
      {
        name: 'Chapainawabganj',
        thanas: ['Chapainawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'],
      },
    ],
  },
  {
    name: 'Khulna',
    districts: [
      {
        name: 'Khulna',
        thanas: [
          'Khulna Sadar',
          'Sonadanga',
          'Khalishpur',
          'Daulatpur',
          'Khan Jahan Ali',
          'Harintana',
          'Batiaghata',
          'Dacope',
          'Dumuria',
          'Dighalia',
          'Koyra',
          'Paikgachha',
          'Phultala',
          'Rupsha',
          'Terokhada',
        ],
      },
      {
        name: 'Jashore',
        thanas: ['Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha'],
      },
      {
        name: 'Kushtia',
        thanas: ['Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Mirpur'],
      },
      {
        name: 'Jhenaidah',
        thanas: ['Jhenaidah Sadar', 'Harinakundu', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'],
      },
      {
        name: 'Satkhira',
        thanas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'],
      },
      {
        name: 'Bagerhat',
        thanas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'],
      },
      {
        name: 'Chuadanga',
        thanas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'],
      },
      {
        name: 'Meherpur',
        thanas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'],
      },
      {
        name: 'Narail',
        thanas: ['Narail Sadar', 'Kalia', 'Lohagara'],
      },
      {
        name: 'Magura',
        thanas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'],
      },
    ],
  },
  {
    name: 'Barishal',
    districts: [
      {
        name: 'Barishal',
        thanas: ['Kotwali', 'Airport', 'Kawnia', 'Barishal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'],
      },
      {
        name: 'Patuakhali',
        thanas: ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Dumki', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Rangabali'],
      },
      {
        name: 'Bhola',
        thanas: ['Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'],
      },
      {
        name: 'Pirojpur',
        thanas: ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad', 'Indurkani'],
      },
      {
        name: 'Barguna',
        thanas: ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'],
      },
      {
        name: 'Jhalokati',
        thanas: ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'],
      },
    ],
  },
  {
    name: 'Sylhet',
    districts: [
      {
        name: 'Sylhet',
        thanas: [
          'Kotwali',
          'Jalalabad',
          'Airport',
          'Shah Paran',
          'Moglabazar',
          'Osmani Nagar',
          'Sylhet Sadar',
          'Balaganj',
          'Beanibazar',
          'Bishwanath',
          'Companiganj',
          'Fenchuganj',
          'Golapganj',
          'Gowainghat',
          'Jaintiapur',
          'Kanaighat',
          'Zakiganj',
          'South Surma',
        ],
      },
      {
        name: 'Moulvibazar',
        thanas: ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal'],
      },
      {
        name: 'Habiganj',
        thanas: ['Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj'],
      },
      {
        name: 'Sunamganj',
        thanas: ['Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Tahirpur', 'Shantiganj', 'Madhyanagar'],
      },
    ],
  },
  {
    name: 'Rangpur',
    districts: [
      {
        name: 'Rangpur',
        thanas: ['Rangpur Sadar', 'Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'],
      },
      {
        name: 'Dinajpur',
        thanas: [
          'Dinajpur Sadar',
          'Birampur',
          'Birganj',
          'Biral',
          'Bochaganj',
          'Chirirbandar',
          'Phulbari',
          'Ghoraghat',
          'Hakimpur',
          'Kaharole',
          'Khansama',
          'Nawabganj',
          'Parbatipur',
        ],
      },
      {
        name: 'Kurigram',
        thanas: ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Nageshwari', 'Phulbari', 'Rajarhat', 'Raomari', 'Ulipur'],
      },
      {
        name: 'Gaibandha',
        thanas: ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Sughatta', 'Sundarganj'],
      },
      {
        name: 'Nilphamari',
        thanas: ['Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Saidpur'],
      },
      {
        name: 'Panchagarh',
        thanas: ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'],
      },
      {
        name: 'Thakurgaon',
        thanas: ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankhail'],
      },
      {
        name: 'Lalmonirhat',
        thanas: ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'],
      },
    ],
  },
  {
    name: 'Mymensingh',
    districts: [
      {
        name: 'Mymensingh',
        thanas: [
          'Mymensingh Sadar',
          'Bhaluka',
          'Dhobaura',
          'Fulbaria',
          'Gaffargaon',
          'Gauripur',
          'Haluaghat',
          'Ishwarganj',
          'Muktagachha',
          'Nandail',
          'Phulpur',
          'Tara Khanda',
        ],
      },
      {
        name: 'Jamalpur',
        thanas: ['Jamalpur Sadar', 'Bakshiganj', 'Dewanganj', 'Islampur', 'Madarganj', 'Melandaha', 'Sarishabari'],
      },
      {
        name: 'Netrokona',
        thanas: ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda', 'Kendua', 'Madan', 'Mohanganj', 'Purbadhala', 'Khaliajuri'],
      },
      {
        name: 'Sherpur',
        thanas: ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'],
      },
    ],
  },
];

export function getDistrictsByDivision(divisionName: string): DistrictData[] {
  const division = BANGLADESH_DIVISIONS.find(
    (d) => d.name.toLowerCase() === divisionName.toLowerCase(),
  );
  return division ? division.districts : [];
}

export function getThanasByDistrict(divisionName: string, districtName: string): string[] {
  const districts = getDistrictsByDivision(divisionName);
  const district = districts.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase(),
  );
  return district ? district.thanas : [];
}

export interface CategoryItem {
  id: string;
  name: string;
  sub: string;
  desc: string;
  tag?: string;
  image: string;
  path: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'panjabi',
    name: 'Panjabi',
    sub: 'Traditional Elegance',
    desc: 'Heritage embroidery paired with contemporary structured drapes.',
    tag: 'Signature',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-PIsbLozCP5fnpvyZ-k60kSTLBh4QX1LmsfLPxmt-js88mmKtE2qsMWHQRxTclOzk2nH_Edm1dm6DiBTlzgwzjmEcVhTDrp9Z-lWVGQ_H6ybcjFhK-CKWG5fqds4Zg3GI_epoqzp89xlIJoGPexlm7WJtsBd-gLnyAfwvodB74CkRDWpiY_khKFKpNLI3ZeK7GK2_EaNpmgAxyp1vNVSOo90BFu53oKE_Cc7rG3rsCZ4kwW1HJcC7kQ',
    path: '/men/panjabi'
  },
  {
    id: 'shirts',
    name: 'Shirts',
    sub: 'Sartorial Precision',
    desc: 'Premium Egyptian cotton formals & breezy semi-formal weaves.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMsLFQN7caKC0paNLeDW6EfAizk7_WaifQN1VcXUeZFuZRQFLOy5bOJsdh6JVdXfJq5Trdopg4fX4t181Kbb3dBsEDSRQUBwBp-qd-Zi33GrX3jcSU694WFmu8bKxfR91lxfEHYoCVE5wdREypJOAmzv_ttLOH1LF-O_KNGuKPrpclfRU5A2wv1ld3Wl68jvTiI9gTKUUc9J6APfORODMHS6_gXzNQJttyQ72U_a02ltkFv0S1bz5isA',
    path: '/men/shirts'
  },
  {
    id: 'polos',
    name: 'Polos',
    sub: 'Luxe Knitwear',
    desc: 'Mercerized piqué fibers engineered for dignified daytime meetings.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAmVsKJzvDEQVHfLGmjgJwWPGJfn1a2OlhNngQ3nQzAJf41R7NnnV-rjHQQV9IFp9bxVMaxpkVVPaHFkoj3KmCIVndJEVqT6qX2HKbHzUolTPekC8iHzLHR3URpP-PAoeYZl8P5c30xXZc4jdqI3oLFuIYkk050s12nCekoOGiT1ZoR8alKDWoeUUNTVz0HB9I0dGbBb0HV051UwtYW1jW1ICC-lA-aVb8auL0lXIg4PfLRdtWxyhdKw',
    path: '/men/polos'
  },
  {
    id: 't-shirts',
    name: 'T-Shirts',
    sub: 'Architectural Cotton',
    desc: 'Heavyweight 260 GSM combed jersey cut for structured draping.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDs1Ix-WsWFI2fw_3l_wt1dSRhnzjpMlmabiXFAhKoSFb_xG3Y0kIZxbqAPBTnsSgboygjFNgzVCh-gh8xYw2p4fzE33Ru7ytk7BIImuAY4IqkacvV9tK38ZTFBcMkryjoJo7GSq3gIUuXvOEnxq_-bk2LgNk2JqhOSr16maOXHpV8HJ18TRm4X6sd_fTAAVMeWxDXh0RFh2WsNmP7o8K8YN3E29oU8s3_F2LIzek52q3OBpKezyB7Jw',
    path: '/men/t-shirts'
  },
  {
    id: 'trousers',
    name: 'Trousers',
    sub: 'Modern Tailoring',
    desc: 'Single-pleat chinos and tailored tropical wool trousers.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfNojW3Mb-iaGZqd3IfUwHc7FerS1DohWFGKI_knJRxsXWwp_5iC5A00YKo5SM08UWWLTtHS3f-zDl-0dUtaJgBjnt2nOE-Q8cfsl_85KDsA4cnBrvo0PzRfOumKm2jc8bhBongguJiugng6HjRtesEf46ilXnPuF6D2Mgs9gGpZeiSmP0lKGdWZB3TELXKWL-Mcem3wZwculGGKpQMMiHEFYt5jjzDwZ6nOr-WXPn8s_XqWacS9HtNg',
    path: '/men/trousers'
  },
  {
    id: 'casual-wear',
    name: 'Casual Wear',
    sub: 'Effortless Ease',
    desc: 'Linen sets, camp-collar shirts, and weekend lounge essentials.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBXBXYsZycaC5UgZhpxdd8qqwv5VJziYh7m4vOBKvnonaCtQNy-bPb6JgNSj7DroBEZPjipvO8wR_WM0Z87LlCJE9wO-sz43GdXzYDFIa7jjjWJ_7WWDw6Xl5qFEfuyK69bVYGqBMypcVF7NNLgRTSqxXtIFhwOHA1nRZxtZMHQGxev-71R401QhaXaGfbbx9XZnVHgCswJuJf_wdP8F91pAqnP0K2Dt9GdfWQdkGTI6R8eO9VebbB4w',
    path: '/men/casual'
  }
];

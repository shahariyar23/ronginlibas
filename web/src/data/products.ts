import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: 'rl-1',
    slug: 'bespoke-emerald-jacquard-panjabi',
    name: 'Bespoke Emerald Jacquard Panjabi',
    category: 'panjabi',
    categoryLabel: 'Imperial Panjabi',
    price: 5850,
    originalPrice: 6800,
    badge: 'NEW IN',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDsI5ug241TvsSl6uRptjdZWUUmaLTgXRnq-N6fF3plJmG4bX3qnBL96Zj__lAnv6CmmwMSQvs3jE80Mo33uOIdI455vzCYnNF5aSZaVZ7WvS6KxN9jTrnGo62nMOazBMaiMY5oZPmH-GfoBuAOBSQe_gCSdPpN2H290wtqPtQXsgN_xpV5ptQbaKzZhRMATVIbDQffLn3YH4UMuADiWsJLKwNKhuVwh9gtoCYuZCNyLI1FNDePkmyH0w'
    ],
    description: 'Cut from high-twist botanical green jacquard silk with intricate tonal motifs. Features handcrafted enamel placket buttons and a modern semi-tailored silhouette designed for grand celebratory evenings.',
    fabric: 'Botanical Jacquard Silk-Linen Blend (180 GSM)',
    fabricOrigin: 'Rajshahi Heritage Weave',
    fit: 'Tailored Slim Fit',
    careGuide: ['Dry clean only', 'Cool iron on reverse', 'Store on wooden hanger'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'Bespoke'],
    colors: [
      { name: 'Emerald Green', hex: '#073A2D' },
      { name: 'Onyx Black', hex: '#1B1C18' },
      { name: 'Ivory Cream', hex: '#FBF9F2' }
    ],
    inStock: true,
    stockCount: 8,
    isNewArrival: true,
    featured: true
  },
  {
    id: 'rl-2',
    slug: 'atelier-mercerized-pique-polo',
    name: 'Atelier Mercerized Pique Polo',
    category: 'polos',
    categoryLabel: 'Signature Knit',
    price: 2450,
    badge: 'BEST SELLER',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDp6prKVoZ0R9-jKzP-YQB8wMT6hbb__r_FtajSVsyjsj7DN258168wzOeWmTZh012sfXVDLYDyBJ9O4WemrbxHYPuvF2wUPDq_tNnslEOs7adSqUHf_4O7sZABfm4uH2cne_54kPrqUdv8fsJKGKGPHfo9FL53SaUzi_iAFvgSNE_lt6cExGqN9ojCKcT8DJNyDX5rI6GQr69inbIUgBAa_V2V-oxKznUWVJcyLSS81-54o9kULUiVBw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUxTbSWn1LCkQCOFMtd5Ws9e4FLeqJu4DvorH6Zec5UruJylFfroN6iv00GOJH6oA1jKzEN5FOS2GdkHo2f6rn5qYwj39YR0TSKNbZ0I4cpyojdnN6TPhjQYPvtUwUzfdvjdeQh_gaYYP9sZMXzP3l6U0Xl_tK7a93HWf0mfHev4q04u6z_jfZ6RMH3gl_SqyL9qpXXJaPm62GQQHUg7Iaoy4prIVlKasGAPgCali6ifCFvutjmG1aJA'
    ],
    description: 'Double-mercerized 100% long-staple cotton polo with subtle natural luster and anti-curl structured collar. Features mother-of-pearl buttons and discreet embroidered textile emblem.',
    fabric: 'Double Mercerized 60/2 Giza Cotton Piqué (220 GSM)',
    fabricOrigin: 'Imported Long-Staple Egyptian Cotton',
    fit: 'Modern Athletic Fit',
    careGuide: ['Machine wash cold gentle cycle', 'Do not tumble dry', 'Warm iron'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Forest Green', hex: '#0D4D3B' },
      { name: 'Off White', hex: '#F5F4ED' },
      { name: 'Midnight Navy', hex: '#0F1A2C' }
    ],
    inStock: true,
    stockCount: 15,
    isBestSeller: true,
    featured: true
  },
  {
    id: 'rl-3',
    slug: 'midnight-pure-linen-kurta-shirt',
    name: 'Midnight Pure Linen Kurta Shirt',
    category: 'shirts',
    categoryLabel: 'Casual Tailoring',
    price: 3190,
    originalPrice: 3990,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlx0LHqSXcLQOXpbkQetGD8eyHb94TqGkGgD98HnCCtDQh3OFIJYvvs_j9cNPJhilnv1rGsbhXbntUhUuxxniGTYz5X7j3PTMTo4c5J8x1SdR7jnHnGnHnyD9N2rywDQLRXBuleTiaCIlPZQ00rqg0Ce5JlKps-InQcZk-CeXTRyvAfJAZ0oiVajfIVIRIT3Pdbz2GrJBbnBgrMT0MueLoAwk_w8edG9ZIDc9FY1r2Tz_9eHRHbndCAQ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCuvyZF9ymFroSlCz3kl6AgIGiEkteyvF9XQkcnGQ1KeavTz4WdwuF42N6sp8O6GuMrqDP6eTVi_MS91Hrqsx1PgbaUj28qlG4MmwC6bBBXsDsJderco18iQ3JAFBhoMzh7lvTqy6Akkrz7MqZbcA4yzuZbO0fbVoZZGBTgIDm-BEXhUfZYZ6-_R9dd4vEsBB9efXpI9WARUH6ZvSsAYOSYMhg21_HPehIF6E3tXF2cqWGu9DEjsD6wFA'
    ],
    description: 'European flax washed linen woven for relaxed breathability in tropical heat. Tailored with a band collar and continuous front placket, blurring the line between kurta and casual shirt.',
    fabric: '100% Certified French Flax Linen (160 GSM)',
    fabricOrigin: 'Normandy Flax / Tangail Loom Finishing',
    fit: 'Relaxed Tailored Fit',
    careGuide: ['Hand wash or delicate machine wash', 'Line dry in shade', 'Steam press'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'Bespoke'],
    colors: [
      { name: 'Midnight Blue', hex: '#122238' },
      { name: 'Ivory', hex: '#FBF9F2' }
    ],
    inStock: true,
    stockCount: 11,
    featured: true
  },
  {
    id: 'rl-4',
    slug: 'terracotta-heritage-silk-panjabi',
    name: 'Terracotta Heritage Silk Panjabi',
    category: 'panjabi',
    categoryLabel: 'Festive Heritage',
    price: 6400,
    originalPrice: 7500,
    badge: "EID '25 PREVIEW",
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPoO8ncniCFqhiPsTg8PdXiFI6fz7283SNNkIxeCtO0Top5tv8XzWhiRaXxje48WR0UDmx2ZHJ57CsEN2OczQsIwDhKGkdj4hU055Jo6Xvask9IOt9TX43xC7xWbMCNiKfGVgyc_xyLOpcRoY7c1pjJwZUpBKp2hcsKy4Sd2Gb6oKf6gzGBHxPn0EROCWwX-jiWeHWJg--ELaEjWwdXqwjRGPIL2ozA63ruBvA-Y2FvnYtmCUCpDl6eA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlcDlOPpPCifMtbR-RPP7yZIM-a57UQHUIXyfjN_HynCWpww8arQv0DH1chspkJH8miRlm_rjqcO6NLwKLDZews9wY6rFx9y1putE9sEST0BHB9HBXZ2CzDpSNCI_6CGwmgO_tui5K5wlkHfXE57ax4zhAXWFO4j8j490YMwRnZPeI_gGPHi8a1uaHH7YU963_M_PgxR7AsKu3l62plgT_48wZ5cRbhgUX2c83E34-4ETqvCLeicB0BQ'
    ],
    description: 'An ode to ancient terracotta temples. Hand-loomed mulberry silk with subtle antique gold thread borders along the neckline and cuffs. Each garment requires 24 hours of artisan weaving.',
    fabric: 'Pure Mulberry Raw Silk with Gilded Zari Edging',
    fabricOrigin: 'Rajshahi Silk Division',
    fit: 'Classic Aristocratic Fit',
    careGuide: ['Specialist dry clean only', 'Do not bleach', 'Store wrapped in muslin cloth'],
    sizes: ['M', 'L', 'XL', 'Bespoke'],
    colors: [
      { name: 'Warm Terracotta', hex: '#9C4A2F' },
      { name: 'Gilded Ochre', hex: '#C79A45' }
    ],
    inStock: true,
    stockCount: 5,
    isNewArrival: true
  },
  {
    id: 'rl-5',
    slug: 'cloth-your-identity-heavy-tee',
    name: '280 GSM "Cloth Your Identity" Heavy Tee',
    category: 't-shirts',
    categoryLabel: 'Street Atelier',
    price: 1450,
    badge: 'ESSENTIAL',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBdFqt7THndAJf7s12_Vp8n4omacNUWuL03XR2dY-qpcZJ5eBfiM603mLt1Tn3blGzVVA9yzpQ4QUmbXC5WWOnfpARMxt-EvaflzfbajVWDhvgUdPwkWEbNc0XwIkRc5qQScZxoHfQ35IjHhnO31yU9PRpzD9-oL72Eb3Q3BG3hxylU8a0xn8ISDTePmfxt3rtWi_TOq_AhCeAn_oLZDyahcgUUan5tKyG7FFH9jgG3yXXaFNhEVDMt_A',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1K1YXC3nXVf1gbeuH5pQPwwPtCg-OF0PEYbUUHNDJCvisuhDpl5Szvb_O5jecVPDssEKo0YMsBCfy8EIbZgogEBwGuF5XmO9XDpVY0HcFsKvdr3190hvQoz69IzoHQ9o5tM7ZA1DAvFl7XE0Z6V0JCyvrxEM8Gs-t3NI27pKzppPmuWzpzpiBsDjt3l_1otxf_D_SPbl5kQ34JJ7Rr8aZUGW1UVWH4GLavxnNpepeNZFExONL5IGMUQ'
    ],
    description: 'Substantial 280 GSM combed cotton jersey tailored with dropped shoulders and a high snug ribbed collar that maintains structure wear after wash.',
    fabric: '280 GSM 100% Combed Organic Cotton',
    fabricOrigin: 'Dhaka Knitting Mills',
    fit: 'Structured Boxy Fit',
    careGuide: ['Machine wash inside out', 'Tumble dry low', 'Do not iron print'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Raw Natural Bone', hex: '#EDE8DD' },
      { name: 'Deep Evergreen', hex: '#073A2D' },
      { name: 'Slate Charcoal', hex: '#26292B' }
    ],
    inStock: true,
    stockCount: 22,
    isBestSeller: true
  },
  {
    id: 'rl-6',
    slug: 'gurkha-pleated-formal-trouser',
    name: 'Gurkha Pleated Formal Trouser',
    category: 'trousers',
    categoryLabel: 'Sartorial Bottoms',
    price: 3650,
    originalPrice: 4200,
    badge: 'STAFF PICK',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDnIXadeSxd9B2plWANgFDSoumaisLSlUT9TPbIDnKr8-x1tLxv6dFWJZwOoUbOfNOMGeq97hj22tXQOCiKtW_lOspl7Dt7H9NFvpD8271o2QikSgdlBVaiKS6bKZfQeawsQL2ucuihtXdqv-KAIkVnP6Tv8Qy9_6zWhfMm8SlrC2MpUQ30G6nww9k49UPnl8VTmPW-gWyfeJtkFTo9qGI8RW7OAiFZnTEC4bEu4hBe2Eg3CWu2cAZCsg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBYxta_cOu799ZhuuymEU187lJ1wdzuxBTBO2GytP32gxwYdWo_SaqE2KgyNuAbNzG6fhxtsNuIIth3hhH5pubbIvW8bv3qElsxc3AX9hDTBEHUhVqO3LAhzwxz3FvTwPfcZU28ISVtAPpMXrX0-uxh5cOAlxylLowZvvK0HsXi7Ghgt48ghwPCqJm-HHe5dFvcxrBO0h7JD6qDqHCz_nMJJD33sURIcogV_u_LEJnXKPlWIMStoMxKow'
    ],
    description: 'High-waisted tailoring featuring iconic cummerbund-style buckle waist closures and deep reverse double pleats. Tapers smoothly to a classic 1.75-inch cuff.',
    fabric: 'Breathable Tropical Wool-Cotton Twill (240 GSM)',
    fabricOrigin: 'Bespoke Suiting Mill',
    fit: 'High-Rise Relaxed Taper',
    careGuide: ['Dry clean or spot clean with damp cloth', 'Steam to refresh'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Olive Bronze', hex: '#4B5320' },
      { name: 'British Khaki', hex: '#C3B091' },
      { name: 'Navy', hex: '#1B263B' }
    ],
    inStock: true,
    stockCount: 7,
    featured: true
  },
  {
    id: 'rl-7',
    slug: 'chikankari-handcrafted-ivory-panjabi',
    name: 'Chikankari Handcrafted Ivory Panjabi',
    category: 'panjabi',
    categoryLabel: 'Artisanal Cotton',
    price: 4950,
    badge: 'ICONIC WEAVE',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgYEgHClbxf6xB-uhopyvQySjGHPdcPmXphWSqAOt_hBZD4m_M6AbiKX_hL_dSpDE_nwxJ5oZVGG5ki0f9PLLf_8nISrTK8sZjhc2pWz0QTjJyJamNpkZaU8TVNztFa7jGM5_-inso85btgdEbFaRBVE4MlvVWKFbY-GO_F79WjkLzkBkg96S6ePkFV5wK9AfCCoNtm95ayEw0AdJ3kb7g9GnHqsbYJMCLB08BrmbGuin_yfiRp8_0_A',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDYUFNnPW0lHDxvETXVmJ4uXl6xado6gdGL7kjc3hnsY6vvZ73USEdx9CrAx3mvdW3TIf2fF9hFbfnDc4H_ZHtLUXaXIC5dJkjfXd2jvrBLDVBpUOD1kNfo_G_jcbYMNMibeA1_HvN_ciRwUCwjczBQdZAhtKdEN1EUfP-342W2iIdRmDY1ENH5CRkNanl9p___eEkickBWpBVCQgkHJN0Zk2pwM68e8LBZGdxHSKvoqyQKF_3lvhehHQ'
    ],
    description: 'Fine muslin cotton decorated with hand-embroidered shadow work Chikankari flora. Finished with mother-of-pearl buttons and tailored cuff detailing.',
    fabric: 'Superfine Handspun Muslin Voile (110 GSM)',
    fabricOrigin: 'Narayanganj & Tangail Heritage Centers',
    fit: 'Standard Editorial Cut',
    careGuide: ['Gentle hand wash in cold water', 'Dry flat', 'Medium heat iron'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'Bespoke'],
    colors: [
      { name: 'Pure Ivory', hex: '#FAF9F6' }
    ],
    inStock: true,
    stockCount: 14,
    isBestSeller: true
  },
  {
    id: 'rl-8',
    slug: 'pinpoint-oxford-button-down',
    name: 'Pinpoint Oxford Button-Down',
    category: 'shirts',
    categoryLabel: 'Essential Tailoring',
    price: 2650,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4Mqe2GU19Ffeze_QM0gip9HMniUVS3hgSwlOR0DXo3C8hzP4YQ_p-PRWAvJ8RRZpl4ko3rYeU03C63y-EZaR3L_Xp-duu7hBjvYv4C-3NXyPxBKIKNYdMBg05UFZqhCAoifk51kfB4Av4976mNRuMN-QJg3H24PRF3r0KqTPp3H5OR79ik3xu0he71U42bq9apo8GcRd7HuR4V7xZZCELb5k3gBCpKwx2Ras67PqbEEtIxMIOKMz67Q',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2NgxlQCO2gUuHDV_lnxut_OmgO67OK97sAC8Krb2AlXTNigC4007l-YJDabxJmJVCbz74UrPDYNkqQuksfTrLiz5oQiuAFeCQXje2Fzdfyz6v0BX3y6SBIhck960MMAiHrNuyWgN-nidJZ_SD2v5_H1ioB4tvb559ZZ8Jb0xH2trqUl-1yneUZ0F34N1iXjJrhUCOQp8eruiPEuRsPv2oi_IBG5dN1mQeNJgiOjNZzaDNMIkOGSWmyw'
    ],
    description: 'Engineered with a perfect collar roll that frames ties or open collars naturally. Woven from 80/2 two-ply yarn for incredible resilience and comfortable breathability.',
    fabric: 'Two-Ply 80s Pinpoint Oxford Cotton (150 GSM)',
    fabricOrigin: 'Fine Shirting Mill',
    fit: 'Tailored Slim Cut',
    careGuide: ['Machine wash warm', 'Warm iron', 'Hang dry'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Sky Azure', hex: '#C2D9EB' },
      { name: 'Forest Green', hex: '#073A2D' }
    ],
    inStock: true,
    stockCount: 19
  },
  {
    id: 'rl-9',
    slug: 'regal-classic-pique-polo',
    name: 'Regal Classic Pique Polo',
    category: 'polos',
    categoryLabel: 'Weekend Knit',
    price: 2450,
    badge: 'ALL MEN',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPVDaT-QS3j7lkM7N7L1SvckY_d0szRqBH4TTl6mrPfKWumCRnw4SBrwZzZCbzbOBoWOSh4CcUw0RG5oJcLqRUi7UUU3hIOZmDFoxTTAN8wKBRUehE1zB_Jn0wgxnKYQgDtJCof8eijaOYL6exUqQeBsSyivchDel-GThA7VniSgEcjZyko-i5uIhcwSJvDZvc-6gac3puPaPF0Y7nKn1DfCZgVAYqseqT0rnfKMdFcPrGy6ydSsEKvA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAAafdrlhs4KAfvn28go2j4Wc5bfrj23xTDpiG-79Ire9PHduckj_WUEeFzO6O1s1lkoNUy_kuLV3K87tbUgqomIKvXw_1Zg_Ged__HdYz_w2l6jPPIuGpY4YowSQDZUHT_T55tnjCjDZORQc1n6IEPyJXwPR2SNkC5uPk7tlV8Hub3_FdsyR6V6J9gHF_5kZb_K5K8_9VoVqlTOJ4a2R1XJKTmjSPi3TmPUYCQ1TxffdI8iwye0g7ysA'
    ],
    description: 'Deep royal blue piqué polo treated with an enzyme-silk wash for unmatched softness against the skin. Finished with ribbed sleeve bands and split vented hems.',
    fabric: 'Combed Compact Pique Cotton (230 GSM)',
    fabricOrigin: 'Tropical Mercerized Knit',
    fit: 'Relaxed Fit',
    careGuide: ['Machine wash cold', 'Lay flat to dry'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Royal Navy', hex: '#112244' },
      { name: 'Onyx', hex: '#1B1C18' }
    ],
    inStock: true,
    stockCount: 9
  },
  {
    id: 'rl-10',
    slug: 'mirpur-emerald-silk-panjabi',
    name: 'Mirpur Emerald Silk Panjabi',
    category: 'panjabi',
    categoryLabel: 'Signature Panjabi',
    price: 4850,
    originalPrice: 5500,
    badge: 'NEW',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD7twbTXZUj3uAgBA0v-FnrwUtMH3L1d6EjLrvwKJU2V4j0hfxp1mPV-F2AMUcqOr0hGZD8T_IniLt8zIfQyIamuF42g8ccBUD6crlWRh67nSdnLPBDRCNPMttFy9SGSHpQ15QK5pYFZ0bdzEhXGS0XNQ_FdCUzIvp2QLYHc0wVFqkKKvv6-FNMzG18zThtEZXtJ7Z3cst8Fskkv-RCxHj2BF5duRq02hP5mkaSyUEgT6nrMS2YvInF1Q',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ'
    ],
    description: 'Masterfully woven Mirpur silk panjabi featuring subtle tone-on-tone embroidery across the chest placket and mandarin collar. Perfect for festive gatherings and wedding ceremonies.',
    fabric: 'Pure Mirpur Silk & Fine Cotton (170 GSM)',
    fabricOrigin: 'Mirpur Silk Artisans, Dhaka',
    fit: 'Tailored Aristocratic Fit',
    careGuide: ['Dry clean recommended', 'Steam iron only'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'Bespoke'],
    colors: [
      { name: 'Emerald', hex: '#073A2D' },
      { name: 'Deep Moss', hex: '#0D4D3B' }
    ],
    inStock: true,
    stockCount: 12,
    isNewArrival: true,
    featured: true
  },
  {
    id: 'rl-11',
    slug: 'nawab-ivory-classic-panjabi',
    name: 'Nawab Ivory Classic Panjabi',
    category: 'panjabi',
    categoryLabel: 'Artisanal Silk',
    price: 4450,
    originalPrice: 5200,
    badge: 'BEST SELLER',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAiY7AoPCtJG19zp0Y0T3FoGoJOtBtW_CM94_Po-St5tglW7qMDNOAJZ0SpEPEkF4s3B5W0QF4PxPKVB42idpJCpZzWm_xRQYdtcUCgfS5hJPiX0ShP0zBsJxyl-HiE_7zl0VidN6w81SriBWL0sGhlO59wDWvSTHVkRaAouHL1u_opvuS0_t8nHLtyPCO5d5jqqqLu3Jm8hivRjSM5FUMJ097BXtFJzkTPX2KyMkDj2Bv9LgXUndocyg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgYEgHClbxf6xB-uhopyvQySjGHPdcPmXphWSqAOt_hBZD4m_M6AbiKX_hL_dSpDE_nwxJ5oZVGG5ki0f9PLLf_8nISrTK8sZjhc2pWz0QTjJyJamNpkZaU8TVNztFa7jGM5_-inso85btgdEbFaRBVE4MlvVWKFbY-GO_F79WjkLzkBkg96S6ePkFV5wK9AfCCoNtm95ayEw0AdJ3kb7g9GnHqsbYJMCLB08BrmbGuin_yfiRp8_0_A'
    ],
    description: 'An iconic tribute to Bengal sartorial heritage. Crafted in an ivory unbleached raw silk blend with clean, sharp collar lines and antique mother-of-pearl buttons.',
    fabric: 'Raw Silk & Fine Cotton Blend (175 GSM)',
    fabricOrigin: 'Rajshahi Silk Heritage',
    fit: 'Classic Tailored Fit',
    careGuide: ['Dry clean only', 'Store in cloth bag'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Ivory Cream', hex: '#FBF9F2' }
    ],
    inStock: true,
    stockCount: 16,
    isBestSeller: true,
    featured: true
  },
  {
    id: 'rl-12',
    slug: 'azure-cotton-linen-oxford',
    name: 'Azure Cotton-Linen Oxford',
    category: 'shirts',
    categoryLabel: 'Atelier Casual',
    price: 2850,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4Mqe2GU19Ffeze_QM0gip9HMniUVS3hgSwlOR0DXo3C8hzP4YQ_p-PRWAvJ8RRZpl4ko3rYeU03C63y-EZaR3L_Xp-duu7hBjvYv4C-3NXyPxBKIKNYdMBg05UFZqhCAoifk51kfB4Av4976mNRuMN-QJg3H24PRF3r0KqTPp3H5OR79ik3xu0he71U42bq9apo8GcRd7HuR4V7xZZCELb5k3gBCpKwx2Ras67PqbEEtIxMIOKMz67Q',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2NgxlQCO2gUuHDV_lnxut_OmgO67OK97sAC8Krb2AlXTNigC4007l-YJDabxJmJVCbz74UrPDYNkqQuksfTrLiz5oQiuAFeCQXje2Fzdfyz6v0BX3y6SBIhck960MMAiHrNuyWgN-nidJZ_SD2v5_H1ioB4tvb559ZZ8Jb0xH2trqUl-1yneUZ0F34N1iXjJrhUCOQp8eruiPEuRsPv2oi_IBG5dN1mQeNJgiOjNZzaDNMIkOGSWmyw'
    ],
    description: 'Subtle slub texture created by a 60% cotton and 40% linen weave. Delivers the casual drape of linen with the wrinkle-resistance of cotton.',
    fabric: 'Cotton-Linen Slub Blend (145 GSM)',
    fabricOrigin: 'Imported Flax Weave',
    fit: 'Relaxed Fit',
    careGuide: ['Machine wash cold', 'Warm iron while slightly damp'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Azure Blue', hex: '#A8C5DA' },
      { name: 'Crisp White', hex: '#FFFFFF' }
    ],
    inStock: true,
    stockCount: 18,
    isBestSeller: true
  }
];

export const products = PRODUCTS;

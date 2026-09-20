import { Cart, CartItem, PrismaClient, Product } from "@prisma/client";

const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Leather Handbag",
    description: "Full-grain calfskin handbag with brushed gold clasp and interior zip pocket. Structured silhouette fits a tablet, wallet, and daily essentials.",
    price: 129900,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "9",
    name: "Quilted Crossbody Bag",
    description: "Diamond-quilted lambskin crossbody with chain-link strap and magnetic snap closure. Compact enough for evenings yet spacious for daily essentials.",
    price: 89900,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "10",
    name: "Structured Tote Bag",
    description: "Full-grain leather tote with reinforced handles and interior zip compartment. Designed for professionals who need room for a 13-inch laptop and daily carry.",
    price: 159900,
    imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "11",
    name: "Suede Shoulder Bag",
    description: "Soft Italian suede shoulder bag with brushed brass hardware and an adjustable strap. The slouchy silhouette adds relaxed elegance to casual outfits.",
    price: 69900,
    imageUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "12",
    name: "Mini Bucket Bag",
    description: "Compact bucket bag in pebbled leather with drawstring closure and detachable shoulder strap. A playful shape that holds more than it looks.",
    price: 54900,
    imageUrl: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "13",
    name: "Woven Leather Clutch",
    description: "Hand-woven strips of vegetable-tanned leather form this envelope clutch. Interior card slots eliminate the need for a separate wallet.",
    price: 44900,
    imageUrl: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "14",
    name: "Canvas and Leather Backpack",
    description: "Waxed canvas body trimmed with saddle leather. Padded laptop sleeve and hidden anti-theft pocket make it ideal for commuting.",
    price: 119900,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "15",
    name: "Metallic Evening Bag",
    description: "Gold-toned metallic leather with a delicate chain strap. The rigid frame keeps its shape, while the satin lining protects delicate items.",
    price: 79900,
    imageUrl: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "16",
    name: "Nylon Shoulder Tote",
    description: "Lightweight ripstop nylon with water-resistant coating and leather trim. Folds flat for packing, expands to carry groceries or gym gear.",
    price: 39900,
    imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "17",
    name: "Satchel Briefcase",
    description: "British-style satchel in bridle leather with buckled straps and a reinforced handle. Fits A4 documents and a 14-inch laptop.",
    price: 249900,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=871&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "18",
    name: "Hobo Shoulder Bag",
    description: "Slouchy crescent shape in nappa leather with a single wide strap. The unlined interior reveals the natural grain of the hide.",
    price: 74900,
    imageUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=871&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "19",
    name: "Micro Phone Bag",
    description: "Tiny crossbody sized exactly for a smartphone and two cards. The chain-link strap doubles as a bracelet when wrapped around the wrist.",
    price: 29900,
    imageUrl: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=871&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "2",
    name: "Designer Sunglasses",
    description: "Stylish sunglasses with UV protection. Made with premium materials.",
    price: 39900,
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "20",
    name: "Aviator Sunglasses",
    description: "Teardrop-shaped polarized lenses in a lightweight titanium frame. Double bridge and adjustable nose pads ensure a secure, comfortable fit.",
    price: 24900,
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "21",
    name: "Wayfarer Sunglasses",
    description: "Acetate frames with green G-15 lenses, originally designed for pilots in the 1950s. A timeless shape that suits most face types.",
    price: 18900,
    imageUrl: "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "22",
    name: "Round Frame Sunglasses",
    description: "Vintage-inspired round lenses with a keyhole bridge. Hand-polished acetate frames in tortoiseshell pattern.",
    price: 21900,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "23",
    name: "Cat-Eye Sunglasses",
    description: "Upswept acetate frames with gradient CR-39 lenses. The exaggerated corners add a bold, feminine touch to any outfit.",
    price: 27900,
    imageUrl: "https://images.unsplash.com/photo-1508296695146-257a814070b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "24",
    name: "Sport Wrap Sunglasses",
    description: "Impact-resistant polycarbonate lenses in a wraparound frame with rubber grip temples. Designed for running, cycling, and outdoor training.",
    price: 15900,
    imageUrl: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "25",
    name: "Oversized Square Sunglasses",
    description: "Bold square silhouette with 100% UVA/UVB protection. Thick acetate frames in matte black with smoke-grey lenses.",
    price: 32900,
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=881&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "26",
    name: "Clubmaster Sunglasses",
    description: "Browline frame combining acetate and metal. Semi-rimless design with polarized lenses that reduce glare on water and pavement.",
    price: 26900,
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=881&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "27",
    name: "Retro Oval Sunglasses",
    description: "Slim oval lenses in a lightweight metal frame. Mirror-coated lenses reflect harsh light while maintaining color accuracy.",
    price: 19900,
    imageUrl: "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&auto=format&fit=crop&w=881&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "28",
    name: "Shield Sunglasses",
    description: "Single continuous lens wraps from temple to temple. Anti-fog coating and adjustable nose pads keep the shield stable during activity.",
    price: 34900,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=881&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "29",
    name: "Polarized Driving Sunglasses",
    description: "Amber-tinted polarized lenses enhance contrast in low light. Flexible memory-metal temples conform to your head shape.",
    price: 22900,
    imageUrl: "https://images.unsplash.com/photo-1508296695146-257a814070b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=881&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "30",
    name: "Floating Sunglasses",
    description: "Hollow-core acetate frames that float on water. Ideal for boating, fishing, and beach days. Hydrophobic lens coating repels water and fingerprints.",
    price: 29900,
    imageUrl: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=881&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "3",
    name: "Silk Scarf",
    description: "Hand-rolled mulberry silk scarf with an abstract motif in muted jewel tones. The 90 cm square drapes naturally around the neck or shoulders.",
    price: 24900,
    imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "31",
    name: "Botanical Print Scarf",
    description: "Hand-rolled edges frame a watercolor botanical print on mulberry silk. The 90 cm square ties easily into a classic French knot.",
    price: 29900,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=871&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "32",
    name: "Geometric Silk Twilly",
    description: "Narrow silk ribbon with a bold geometric print. Wear as a necktie, wrist wrap, or threaded through a handbag handle.",
    price: 14900,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=871&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "33",
    name: "Paisley Silk Stole",
    description: "Oversized paisley motif printed on lightweight silk challis. Large enough to drape over the shoulders as an evening wrap.",
    price: 49900,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "34",
    name: "Abstract Silk Square",
    description: "Contemporary abstract design digitally printed on heavy-gauge silk twill. The saturated colors hold up after repeated dry cleaning.",
    price: 34900,
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=872&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "35",
    name: "Animal Print Silk Scarf",
    description: "Leopard-spot pattern on a sand-coloured ground. Rolled and hand-stitched edges prevent fraying without added bulk.",
    price: 27900,
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=871&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "36",
    name: "Nautical Stripe Scarf",
    description: "Breton-stripe silk and cashmere blend that works year-round. Lightweight enough to tuck into a coat pocket in spring.",
    price: 39900,
    imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=873&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "37",
    name: "Floral Foulard",
    description: "Ditsy floral print on crêpe de chine silk. The matte finish gives it a relaxed, everyday feel compared to high-shine satin.",
    price: 22900,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=872&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "38",
    name: "Heritage Tartan Scarf",
    description: "Classic tartan weave in muted earth tones. Fringed ends add texture without unravelling, thanks to a twisted-fringe finish.",
    price: 31900,
    imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=872&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "39",
    name: "Ombré Silk Wrap",
    description: "Gradient dye transitions from deep indigo to pale lavender. The generous 140 cm length allows multiple styling options.",
    price: 44900,
    imageUrl: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=874&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "40",
    name: "Polka Dot Silk Kerchief",
    description: "Triangular silk kerchief with a micro polka-dot print. Tuck into a blazer pocket or tie loosely around the neck.",
    price: 18900,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=873&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "41",
    name: "Marble Print Silk Scarf",
    description: "Swirling marble pattern achieved through traditional marbling technique on silk satin. Each scarf has slightly different variations.",
    price: 36900,
    imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&auto=format&fit=crop&w=875&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "4",
    name: "Leather Wallet",
    description: "Handcrafted leather wallet with multiple card slots and a coin pocket.",
    price: 19900,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "42",
    name: "Slim Card Holder",
    description: "Six card slots in a profile under 1 cm. Crafted from saffiano leather that resists scratches and maintains its shape over time.",
    price: 9900,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=775&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "43",
    name: "Bifold Wallet",
    description: "Classic bifold with 8 card slots, two bill compartments, and an ID window. Edge-painted finish seals the leather edges against wear.",
    price: 14900,
    imageUrl: "https://images.unsplash.com/photo-1575032617751-6ddec2089882?ixlib=rb-4.0.3&auto=format&fit=crop&w=776&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "44",
    name: "Zip-Around Wallet",
    description: "Full zip closure keeps coins and receipts secure. Interior features 12 card slots, a coin pouch, and two note compartments.",
    price: 24900,
    imageUrl: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=777&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "45",
    name: "Money Clip Wallet",
    description: "Spring-loaded stainless steel money clip on the exterior, six card slots inside. Saves pocket space without sacrificing capacity.",
    price: 17900,
    imageUrl: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?ixlib=rb-4.0.3&auto=format&fit=crop&w=778&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "46",
    name: "RFID Blocking Wallet",
    description: "Built-in RFID shield prevents contactless theft. Full-grain leather exterior with a soft microfibre lining to protect phone screens.",
    price: 29900,
    imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=779&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "47",
    name: "Travel Wallet",
    description: "Passport sleeve, boarding-pass slot, and pen loop in one zip-around wallet. Holds up to 10 cards plus foreign currency.",
    price: 39900,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=780&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "48",
    name: "Coin Purse",
    description: "Drawstring coin purse in pebbled leather. Compact enough to slip into a jacket pocket or small clutch.",
    price: 5900,
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=781&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "49",
    name: "Long Wallet",
    description: "Full-length wallet with a snap-button closure. 12 card slots, zip coin pocket, and two bill sections keep notes unwrinkled.",
    price: 34900,
    imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=782&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "50",
    name: "Phone Wallet Case",
    description: "Leather phone wallet with magnetic flap, three card slots, and a cash pocket. Compatible with MagSafe charging.",
    price: 49900,
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=783&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "51",
    name: "Key Case Wallet",
    description: "Four key hooks inside a zip-around leather case with four card slots. Eliminates loose keys scratching your phone.",
    price: 22900,
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=784&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "52",
    name: "Vertical Card Wallet",
    description: "Vertical orientation for quick card access. Pull-tab slot for your most-used card, plus four additional slots inside.",
    price: 12900,
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=785&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "5",
    name: "Designer Watch",
    description: "Elegant watch with a stainless steel case and leather strap.",
    price: 299900,
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=776&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "53",
    name: "Chronograph Watch",
    description: "Three-subdial chronograph with tachymeter bezel. 42 mm case houses a Japanese automatic movement with 42-hour power reserve.",
    price: 449900,
    imageUrl: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=777&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "54",
    name: "Dive Watch",
    description: "Water-resistant to 300 m with a unidirectional rotating bezel. Luminous indices and hands remain legible at depth.",
    price: 349900,
    imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=778&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "55",
    name: "Minimalist Dress Watch",
    description: "Ultra-thin 38 mm case with a single date window. Clean dial and slim profile slide easily under a shirt cuff.",
    price: 199900,
    imageUrl: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=779&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "56",
    name: "Pilot Watch",
    description: "Large numerals and an oversized crown designed for gloved hands. Double-domed sapphire crystal resists cockpit glare.",
    price: 599900,
    imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=780&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "57",
    name: "Field Watch",
    description: "Mil-spec design with a 24-hour inner ring and canvas NATO strap. Scratch-resistant crystal and a screw-down crown handle rough conditions.",
    price: 279900,
    imageUrl: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?ixlib=rb-4.0.3&auto=format&fit=crop&w=781&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "58",
    name: "Skeleton Watch",
    description: "Open-heart dial reveals the escapement and mainspring. The exhibition caseback shows the full movement architecture.",
    price: 799900,
    imageUrl: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=782&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "59",
    name: "Racing Chronograph",
    description: "Rally-inspired perforated leather strap and a tachymeter scale on the bezel. Orange accents on the chronograph hands aid quick reading.",
    price: 549900,
    imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=783&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "60",
    name: "Automatic GMT Watch",
    description: "Dual-timezone hand lets you track a second time zone while travelling. 40 mm steel case with a ceramic bezel insert.",
    price: 699900,
    imageUrl: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=784&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "61",
    name: "Moonphase Watch",
    description: "Animated moonphase complication at 6 o'clock paired with a date sub-dial. Guilloché dial catches light at different angles.",
    price: 899900,
    imageUrl: "https://images.unsplash.com/photo-1526045431048-f857369baa09?ixlib=rb-4.0.3&auto=format&fit=crop&w=785&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "62",
    name: "Solar-Powered Watch",
    description: "Eco-drive movement charges from any light source. Never needs a battery replacement and runs for six months in total darkness.",
    price: 179900,
    imageUrl: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=786&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "63",
    name: "Smart Hybrid Watch",
    description: "Traditional analog hands with a hidden notification LED and step counter. Water-resistant to 50 m with a 12-month battery life.",
    price: 249900,
    imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=787&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "6",
    name: "Leather Belt",
    description: "Premium leather belt with a designer buckle. Perfect for formal occasions.",
    price: 14900,
    imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "64",
    name: "Reversible Leather Belt",
    description: "Two-tone reversible strap: black on one side, dark brown on the other. A single brushed nickel buckle flips to match either face.",
    price: 24900,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=871&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "65",
    name: "Braided Elastic Belt",
    description: "Stretch-woven elastic with a braided texture and a polished buckle. Conforms comfortably to the waist without a stiff leather break-in.",
    price: 12900,
    imageUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=872&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "66",
    name: "Classic Western Belt",
    description: "Full-grain cowhide with embossed floral tooling and a brass buckle. The tapered tip and keeper loops are stitched for durability.",
    price: 39900,
    imageUrl: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=873&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "67",
    name: "Canvas Web Belt",
    description: "Heavy-duty cotton webbing with a military-style slide buckle. Available in multiple widths to fit belt loops on chinos and jeans alike.",
    price: 7900,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=874&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "68",
    name: "Suede Dress Belt",
    description: "Nubuck suede in a slim 30 mm width with a mirror-polished buckle. The soft nap pairs well with tailored trousers and loafers.",
    price: 19900,
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=875&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "69",
    name: "Woven Leather Belt",
    description: "Interlaced strips of vegetable-tanned leather create a flexible, breathable strap. No holes needed thanks to the sliding buckle mechanism.",
    price: 29900,
    imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=876&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "70",
    name: "Casual Ratchet Belt",
    description: "Micro-adjust ratchet track inside the strap offers 38 size positions instead of traditional holes. Fine-tune the fit after every meal.",
    price: 22900,
    imageUrl: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=877&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "71",
    name: "Genuine Patent Belt",
    description: "High-gloss patent leather for black-tie events and formal dinners. The slim silhouette disappears under a dress shirt.",
    price: 34900,
    imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&auto=format&fit=crop&w=878&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "72",
    name: "Double-Grommet Belt",
    description: "Double rows of matte gunmetal grommets on a smooth leather strap. Adds edge to denim and leather jackets.",
    price: 16900,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=879&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "73",
    name: "Printed Canvas Belt",
    description: "All-over tonal print on a durable canvas strap with a brass pin buckle. A casual option for weekend wear and summer shorts.",
    price: 9900,
    imageUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "74",
    name: "Suede Western Belt",
    description: "Distressed suede with a vintage-style buckle and snap keeper. The wider 38 mm width sits comfortably on boot-cut jeans.",
    price: 27900,
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=881&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "7",
    name: "Designer Shoes",
    description: "Handcrafted leather shoes with a unique design. Comfortable and stylish.",
    price: 89900,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "75",
    name: "Chelsea Boots",
    description: "Elastic side panels and a pull tab at the heel make these leather Chelsea boots easy to slip on and off. Goodyear-welted sole can be resoled multiple times.",
    price: 189900,
    imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&auto=format&fit=crop&w=881&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "76",
    name: "Suede Loafers",
    description: "Unlined suede penny loafers with a hand-stitched moc toe. The flexible crepe sole breaks in within a day of wear.",
    price: 149900,
    imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&auto=format&fit=crop&w=882&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "77",
    name: "Oxford Brogues",
    description: "Full-brogue wing-tip Oxfords in burnished calfskin. Perforated detailing along the seams adds character without sacrificing formality.",
    price: 219900,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=883&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "78",
    name: "Canvas Sneakers",
    description: "Minimalist canvas upper with a vulcanised rubber sole. Clean lines pair with everything from chinos to summer shorts.",
    price: 59900,
    imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=884&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "79",
    name: "Desert Boots",
    description: "Chukka-style desert boots in sand suede with a crepe sole. Two eyelet lacing keeps the silhouette streamlined.",
    price: 139900,
    imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=885&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "80",
    name: "Monk Strap Shoes",
    description: "Double monk strap in polished leather with antique brass buckles. A strong alternative to laced Oxfords for business settings.",
    price: 199900,
    imageUrl: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=886&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "81",
    name: "Espadrille Sandals",
    description: "Jute-wrapped sole with a canvas upper and ankle tie. A warm-weather staple that travels flat in a suitcase.",
    price: 49900,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=887&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "82",
    name: "Leather Ankle Boots",
    description: "Pointed-toe ankle boots in smooth leather with a stacked Cuban heel. Side zip entry makes on and off effortless.",
    price: 229900,
    imageUrl: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=886&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "83",
    name: "Running Trainers",
    description: "Engineered knit upper with responsive foam midsole and a carbon-fibre plate for energy return. Weighs just 220 grams.",
    price: 159900,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=888&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "84",
    name: "Platform Sandals",
    description: "Leather strap sandals on a 5 cm platform sole. The contoured footbed supports the arch for all-day comfort.",
    price: 109900,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=889&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "85",
    name: "Wingtip Boots",
    description: "Brogue-detailed wingtip boots in waterproof leather. A Vibram Arctic Grip outsole handles icy pavements with confidence.",
    price: 259900,
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=887&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "8",
    name: "Silk Tie",
    description: "Luxurious silk tie with a unique pattern. Perfect for formal occasions.",
    price: 12900,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=778&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "86",
    name: "Knit Skinny Tie",
    description: "Textured grenadine silk knit in a slim 6 cm width. The squared-off bottom adds a modern touch to suits and blazers.",
    price: 9900,
    imageUrl: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?ixlib=rb-4.0.3&auto=format&fit=crop&w=779&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "87",
    name: "Plaid Wool Tie",
    description: "Flannel wool in a muted tartan pattern. The soft hand and matte finish pair naturally with tweed jackets in autumn.",
    price: 14900,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=780&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "88",
    name: "Paisley Silk Tie",
    description: "Rich burgundy paisley on a navy ground. The jacquard weave gives the pattern a raised texture you can feel under your fingertips.",
    price: 16900,
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=781&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "89",
    name: "Solid Grenadine Tie",
    description: "Open-weave grenadine silk in a solid colour. The textured surface adds visual interest to an otherwise plain tie.",
    price: 18900,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=782&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "90",
    name: "Bow Tie",
    description: "Self-tie butterfly bow tie in silk satin. The adjustable strap fits neck sizes from 34 cm to 46 cm.",
    price: 11900,
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=783&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "91",
    name: "Striped Repp Tie",
    description: "Diagonal repp stripe in university colours on a woven silk ground. A prep-school classic that works year-round.",
    price: 13900,
    imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=784&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "92",
    name: "Floral Silk Tie",
    description: "Small-scale floral print on a dark navy ground. The muted palette keeps the pattern subtle enough for daily office wear.",
    price: 15900,
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=785&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "93",
    name: "Linen Summer Tie",
    description: "Breathable linen-blend tie with a textured weave. The unlined construction drapes loosely for a relaxed, warm-weather look.",
    price: 10900,
    imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=786&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "94",
    name: "Polka Dot Tie",
    description: "Micro polka dots on a charcoal ground. The seven-fold construction means no interlining, giving the tie a luxurious drape.",
    price: 17900,
    imageUrl: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=787&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "95",
    name: "Knit Grenadine Tie",
    description: "Open-weave knit grenadine in a deep forest green. The textured surface catches light differently than flat silk.",
    price: 12900,
    imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=788&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  },
  {
    id: "96",
    name: "Bolo Tie",
    description: "Sterling silver slide on a braided leather cord with metal tips. A Western-inspired alternative to traditional neckties.",
    price: 21900,
    imageUrl: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=789&q=80",
    createdAt: new Date("2026-09-19T14:40:09.602420"),
    updatedAt: new Date("2026-09-19T14:40:09.602420")
  }
];

// Mock cart data
let mockCarts: Cart[] = [];
let mockCartItems: CartItem[] = [];
let cartIdCounter = 1;
let cartItemIdCounter = 1;

// Mock PrismaClient implementation
export const mockPrisma = {
  product: {
    findMany: async ({ orderBy }: any = {}) => {
      if (orderBy && orderBy.id === "desc") {
        return [...sampleProducts].reverse();
      }
      return sampleProducts;
    },
    findUnique: async ({ where }: any) => {
      return sampleProducts.find(p => p.id === where.id) || null;
    },
    update: async ({ where, data }: any) => {
      const product = sampleProducts.find(p => p.id === where.id);
      if (!product) throw new Error(`Product ${where.id} not found`);
      Object.assign(product, data, { updatedAt: new Date() });
      return product;
    },
    create: async ({ data }: any) => {
      const newProduct = {
        ...data,
        id: String(sampleProducts.length + 1),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      sampleProducts.push(newProduct as Product);
      return newProduct;
    }
  },
  cart: {
    findFirst: async ({ where, include }: any) => {
      const cart = mockCarts.find(c => c.userId === where?.userId);
      if (!cart) return null;
      
      if (include?.items?.include?.product) {
        const items = mockCartItems
          .filter(item => item.cartId === cart.id)
          .map(item => ({
            ...item,
            product: sampleProducts.find(p => p.id === item.productId)!
          }));
        
        return {
          ...cart,
          items
        };
      }
      
      return cart;
    },
    findUnique: async ({ where, include }: any) => {
      const cart = mockCarts.find(c => c.id === where?.id);
      if (!cart) return null;
      
      if (include?.items?.include?.product) {
        const items = mockCartItems
          .filter(item => item.cartId === cart.id)
          .map(item => ({
            ...item,
            product: sampleProducts.find(p => p.id === item.productId)!
          }));
        
        return {
          ...cart,
          items
        };
      }
      
      return cart;
    },
    create: async ({ data }: any) => {
      const newCart: Cart = {
        id: String(cartIdCounter++),
        userId: data.userId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockCarts.push(newCart);
      return newCart;
    },
    delete: async ({ where }: any) => {
      const index = mockCarts.findIndex(c => c.id === where.id);
      if (index !== -1) {
        const deletedCart = mockCarts[index];
        mockCarts.splice(index, 1);
        // Also delete cart items
        mockCartItems = mockCartItems.filter(item => item.cartId !== where.id);
        return deletedCart;
      }
      return null;
    }
  },
  cartItem: {
    create: async ({ data }: any) => {
      const newItem: CartItem = {
        id: String(cartItemIdCounter++),
        productId: data.productId,
        quantity: data.quantity,
        cartId: data.cartId
      };
      mockCartItems.push(newItem);
      return newItem;
    },
    deleteMany: async ({ where }: any) => {
      const count = mockCartItems.filter(item => item.cartId === where.cartId).length;
      mockCartItems = mockCartItems.filter(item => item.cartId !== where.cartId);
      return { count };
    },
    updateMany: async ({ where, data }: any) => {
      const itemsToUpdate = mockCartItems.filter(
        item => item.cartId === where.cartId && item.productId === where.productId
      );
      
      for (const item of itemsToUpdate) {
        Object.assign(item, data);
      }
      
      return { count: itemsToUpdate.length };
    },
    findFirst: async ({ where }: any) => {
      return mockCartItems.find(
        item => item.cartId === where.cartId && item.productId === where.productId
      ) || null;
    },
    delete: async ({ where }: any) => {
      const index = mockCartItems.findIndex(item => item.id === where.id);
      if (index !== -1) {
        const deletedItem = mockCartItems[index];
        mockCartItems.splice(index, 1);
        return deletedItem;
      }
      return null;
    },
    createMany: async ({ data }: any) => {
      const newItems = data.map((itemData: any) => {
        const newItem: CartItem = {
          id: String(cartItemIdCounter++),
          productId: itemData.productId,
          quantity: itemData.quantity,
          cartId: itemData.cartId
        };
        mockCartItems.push(newItem);
        return newItem;
      });
      
      return { count: newItems.length };
    }
  },
  $transaction: async (callback: any) => {
    return await callback(mockPrisma);
  }
} as unknown as PrismaClient;

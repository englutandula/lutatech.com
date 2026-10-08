export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: 'Passport & Identity' | 'Security & Privacy' | 'PDF & Documents' | 'Image & Design' | 'Developer';
  publishedAt: string;
  readTime: string;
  author: string;
  relatedToolSlug: string;
  relatedToolName: string;
  sections: Array<{
    heading: string;
    content: string[];
    tips?: string[];
  }>;
}

export const guides: Guide[] = [
  {
    slug: 'passport-photo-requirements-guide',
    title: 'Official 2026 Passport & Visa Photo Requirements: Complete Dimension & Biometric Standards',
    description:
      'A comprehensive country-by-country breakdown of biometric passport and visa photo dimensions, lighting rules, background colors, and how to avoid photo rejection.',
    category: 'Passport & Identity',
    publishedAt: 'October 2, 2026',
    readTime: '6 min read',
    author: 'Luta Tech Identity Team',
    relatedToolSlug: 'passport',
    relatedToolName: 'Passport & Visa Photo Maker',
    sections: [
      {
        heading: '1. Why Biometric Passport Photo Standards Matter',
        content: [
          'Applying for a passport or international visa requires meeting exacting government specifications. According to international consular statistics, improper photographs account for over 25% of all passport application delays and rejections worldwide.',
          'Government agencies use automated facial recognition software to scan biometric features — including inter-pupillary distance, jawline geometry, and chin-to-crown proportions. Even minor shadows, tilted head angles, or incorrect background hues can trigger automated rejection flags.',
        ],
        tips: [
          'Ensure your camera lens is placed directly at eye level, roughly 4 to 6 feet away from your face.',
          'Always keep both eyes open, with a neutral facial expression (mouth closed, no teeth showing).',
        ],
      },
      {
        heading: '2. Standard Dimensions Across Major Regions',
        content: [
          'Different nations enforce distinct dimensions and margin requirements. Below are the official standards for 2026:',
          '• United States: 2 × 2 inches (51 × 51 mm). The head must be centered and measure between 1 inch and 1 3/8 inches (25–35 mm) from the bottom of the chin to the top of the head. Requires a pure white or off-white background.',
          '• United Kingdom & European Union (Schengen): 35 × 45 mm (roughly 1.38 × 1.77 inches). Chin-to-crown height must occupy between 70% and 80% of the vertical frame (32–36 mm). UK requires a plain light gray or cream background; Schengen accepts light gray or white.',
          '• Canada: 50 × 70 mm (2 × 2 3/4 inches). Face height between 31 mm and 36 mm from chin to crown. Requires a solid white or light-colored backdrop.',
          '• East Africa (Tanzania, Kenya, Uganda, Rwanda): 35 × 45 mm (or 2 × 2 inches for select visa classes). Pure white or light sky blue background depending on whether the application is for an East African Community e-Passport or national ID card.',
          '• India: 2 × 2 inches (51 × 51 mm) for OCI and visa applications, or 35 × 35 mm for standard domestic passports, on a pure white backdrop.',
        ],
      },
      {
        heading: '3. Essential Rules for Eyeglasses, Headwear, and Attire',
        content: [
          'Eyeglasses Policy: In almost all jurisdictions — including the US State Department and UK HM Passport Office — prescription eyeglasses and sunglasses must be removed. Flash reflection and frame obstruction frequently blind facial recognition algorithms.',
          'Headwear & Hair: Hats, caps, and headbands are prohibited. Religious head coverings (such as hijabs, turbans, or yarmulkes) are permitted, provided they do not cast shadows on the face and the full facial oval from the tip of the chin to the top of the forehead remains unobstructed.',
          'Attire Recommendations: Avoid white shirts if taking photos against a white background, as your shoulders will blend into the backdrop. Wear dark, contrasting casual clothing. Avoid uniforms or military camouflage.',
        ],
        tips: [
          'Position two soft light sources in front of you at 45-degree angles to completely eliminate harsh shadows under your nose and chin.',
          'Never use selfie cameras held at arm\'s length; wide-angle mobile lenses distort nose proportions. Have a friend take the shot or use a tripod with a timer.',
        ],
      },
      {
        heading: '4. How to Create and Print Compliant Photos at Home',
        content: [
          'Instead of paying $15 to $25 at post offices or retail pharmacies, modern in-browser tools like LutaTech allow you to convert any smartphone photo into a compliant biometric portrait in seconds.',
          'By generating a 4×6 inch (10×15 cm) multi-photo print layout at standard 300 DPI, you can print a sheet containing up to six compliant passport photos for pennies at any standard photo kiosk or home photo printer.',
        ],
      },
    ],
  },
  {
    slug: 'client-side-privacy-benefits',
    title: 'Why In-Browser (Client-Side) File Processing is the Future of Web Privacy',
    description:
      'Discover the cybersecurity advantages of client-side WebAssembly architectures and why processing sensitive documents in-browser prevents data leaks.',
    category: 'Security & Privacy',
    publishedAt: 'October 4, 2026',
    readTime: '5 min read',
    author: 'Luta Tech Security Team',
    relatedToolSlug: 'pdf-compressor',
    relatedToolName: 'PDF Compressor',
    sections: [
      {
        heading: '1. The Traditional Cloud Upload Vulnerability',
        content: [
          'For decades, web utilities followed a legacy client-server architecture: to compress an image, convert a PDF, or format text, the user uploaded their file to a third-party server. The server performed the operation in a worker container and returned a download link.',
          'While convenient, this model introduces significant security vulnerabilities for sensitive documents like medical records, tax filings, legal contracts, and financial statements. Even reputable platforms may retain temporary files, generate unauthenticated Amazon S3 download links, or store residual metadata in server logs.',
        ],
      },
      {
        heading: '2. The Shift to Client-Side Computing & WebAssembly',
        content: [
          'Recent advancements in modern browser engines (V8, JavaScriptCore, Gecko) and the emergence of WebAssembly (Wasm) have eliminated the need for server-side processing for many routine digital tasks.',
          'WebAssembly allows compiled C, C++, and Rust code to execute at near-native speeds directly inside your web browser. Tasks like PDF rasterization, image encoding, cryptographic hashing, and color transformation can now run entirely on the user\'s local device CPU and GPU.',
        ],
        tips: [
          'Zero network transmission means your confidential files are impervious to intercept attacks or accidental cloud database misconfigurations.',
          'Client-side tools continue functioning even when your internet connection drops or in secure offline intranet environments.',
        ],
      },
      {
        heading: '3. Compliance Benefits: GDPR, CCPA, and HIPAA',
        content: [
          'From a regulatory standpoint, client-side processing fundamentally redefines data privacy compliance. Under regulations like the European Union\'s General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), transferring personal data across international borders triggers strict governance requirements.',
          'With a zero-knowledge, client-side architecture like LutaTech, the platform operator never acts as a Data Processor because the data never leaves the user\'s local hardware.',
        ],
      },
    ],
  },
  {
    slug: 'pdf-compression-methods-explained',
    title: 'How to Compress Large PDF Documents for Email and Portals Without Quality Loss',
    description:
      'Learn how modern PDF optimization works under the hood: image re-sampling, vector stream deduplication, and DPI thresholds for crisp readability.',
    category: 'PDF & Documents',
    publishedAt: 'October 5, 2026',
    readTime: '5 min read',
    author: 'Luta Tech Document Engineering',
    relatedToolSlug: 'pdf-compressor',
    relatedToolName: 'PDF Compressor',
    sections: [
      {
        heading: '1. Why Do PDF Files Get Bloated?',
        content: [
          'PDF (Portable Document Format) is a container format designed to preserve complex typography, vector paths, layers, and multimedia across any display device. However, common office workflows often inflate file sizes unnecessarily.',
          'The primary culprits behind massive 50MB+ PDF documents are uncompressed image scans (scanned at 600 or 1200 DPI), unoptimized slide decks exported with full-bleed photographs, and embedded duplicate font subsets.',
        ],
      },
      {
        heading: '2. Understanding PDF Compression: Lossless vs Lossy',
        content: [
          'To reduce file size without ruining readability, modern compression engines utilize a dual-pronged approach:',
          '• Lossless Stream Optimization: Stripping redundant metadata, unreferencing unused fonts, and re-compressing PDF content streams using standard Flate/Deflate algorithms. This reduces file size with zero change to visual appearance.',
          '• Intelligent Image Resampling: Embedded raster photographs are downsampled from excessive scan resolutions (e.g., 600 DPI) to balanced web-ready densities (150 DPI for desktop viewing or 72 DPI for mobile attachments), typically reducing file weight by 70% to 85%.',
        ],
        tips: [
          'For legal contracts or resumes submitted via online job portals, choose a balanced preset that preserves 150 DPI text legibility.',
          'For internal email distribution with strict 10MB or 25MB limits, extreme compression safely eliminates oversized background images while keeping text selectable.',
        ],
      },
      {
        heading: '3. The Importance of Vector Text Preservation',
        content: [
          'A common mistake with low-quality compression tools is flattening the entire PDF into a low-resolution bitmap image. This destroys selectable text, removes hyperlinks, and makes text blurry when zooming in.',
          'Professional tools like LutaTech\'s PDF Compressor isolate image objects while leaving true vector text streams untouched, ensuring you can still search, copy, and highlight text seamlessly.',
        ],
      },
    ],
  },
  {
    slug: 'image-formats-guide-webp-png-jpeg',
    title: 'WebP vs PNG vs JPEG: Choosing the Right Format for Web Speed and Print',
    description:
      'An in-depth technical comparison of JPEG, PNG, and modern WebP image formats, compression ratios, alpha transparency, and ideal use cases.',
    category: 'Image & Design',
    publishedAt: 'October 6, 2026',
    readTime: '6 min read',
    author: 'Luta Tech Media Lab',
    relatedToolSlug: 'image-resizer',
    relatedToolName: 'Image Resizer',
    sections: [
      {
        heading: '1. The Evolution of Web Image Standards',
        content: [
          'Digital images constitute over 60% of total web page weight. Selecting the appropriate format directly dictates page speed, SEO Core Web Vitals (Largest Contentful Paint), and data consumption for your visitors.',
          'While JPEG and PNG have been the pillars of the internet since the 1990s, modern formats like WebP offer superior mathematical compression algorithms engineered specifically for today\'s high-resolution displays.',
        ],
      },
      {
        heading: '2. Format Breakdown: Strengths and Trade-Offs',
        content: [
          '• JPEG (Joint Photographic Experts Group): Best for natural photography and complex scenery with smooth color gradations. Uses lossy discrete cosine transform compression. Does not support transparency.',
          '• PNG (Portable Network Graphics): A lossless format utilizing Deflate compression. Ideal for UI graphics, logos, diagrams, and illustrations where crisp pixel boundaries and transparent alpha channels are mandatory. File sizes can become unwieldy for photographs.',
          '• WebP: Developed by Google, WebP supports both lossy and lossless compression, alongside transparent alpha channels. WebP lossy images are typically 25% to 34% smaller than comparable JPEG images at identical visual quality scores (SSIM).',
        ],
        tips: [
          'Use WebP for website hero images, blog thumbnails, and e-commerce catalogs to achieve top Google PageSpeed scores.',
          'Use PNG when preparing transparent logos, product icons, or typography that must stay pin-sharp.',
          'Use JPEG for photographic prints and physical photo studio development.',
        ],
      },
      {
        heading: '3. Browser Compatibility in 2026',
        content: [
          'WebP is now supported natively across Google Chrome, Apple Safari (iOS & macOS), Mozilla Firefox, Microsoft Edge, and Opera — representing over 97% of worldwide browser traffic. The legacy need for fallback images has effectively disappeared for mainstream web development.',
        ],
      },
    ],
  },
  {
    slug: 'understanding-base64-encoding',
    title: 'Understanding Base64 Encoding: What It Is, How It Works, and When Developers Use It',
    description:
      'Everything developers need to know about Base64: binary-to-text radix-64 representation, Data URIs, performance trade-offs, and security practices.',
    category: 'Developer',
    publishedAt: 'October 7, 2026',
    readTime: '5 min read',
    author: 'Luta Tech Engineering',
    relatedToolSlug: 'base64-converter',
    relatedToolName: 'Base64 Converter',
    sections: [
      {
        heading: '1. What is Base64 Encoding?',
        content: [
          'In computer systems, Base64 is a binary-to-text encoding scheme that translates raw binary data (such as image bytes, cryptographic keys, or compiled code) into a sequence of 64 printable ASCII characters (A-Z, a-z, 0-9, +, and /).',
          'It was originally designed for legacy protocols like SMTP (email MIME), where transmission channels could only safely transmit 7-bit ASCII text without corrupting binary byte values.',
        ],
      },
      {
        heading: '2. The Mathematics: How 3 Bytes Become 4 Characters',
        content: [
          'Base64 groups binary data into 6-bit chunks (since 2^6 = 64). Because standard bytes are 8 bits, Base64 takes 3 bytes of binary data (24 bits) and splits them into 4 separate 6-bit indices.',
          'Each 6-bit index maps to a character in the Base64 alphabet. If the total number of input bytes is not divisible by 3, the output is padded with one or two "=" symbols.',
          'Because 3 bytes are represented by 4 characters, Base64 encoding consistently increases the payload size by approximately 33%.',
        ],
        tips: [
          'Never use Base64 to "encrypt" sensitive passwords or secrets. Base64 is a transparent encoding format, not an encryption cipher. Anyone can decode it with one line of code.',
          'Use Data URIs (data:image/png;base64,...) only for tiny icons or inline SVG graphics. Inlining multi-megabyte images in CSS blocks HTML rendering and wastes bandwidth.',
        ],
      },
      {
        heading: '3. Common Modern Use Cases',
        content: [
          '• Inline Small Assets: Inlining small 1KB favicon or tracking pixel assets into HTML or CSS to eliminate separate HTTP round-trips.',
          '• API Payloads: Sending audio samples, thumbnail avatars, or signatures inside JSON REST payloads where binary streams are difficult to format.',
          '• Cryptographic Tokens: Formatting public keys (PEM format) and JWT (JSON Web Tokens) headers and signatures into safe URL transport formats.',
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

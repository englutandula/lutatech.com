import PhotoTool from '@/components/PhotoTool'

const COUNTRIES = [
  { name: 'United States', flag: '🇺🇸', size: '2×2 inches (51×51 mm)' },
  { name: 'European Union', flag: '🇪🇺', size: '35×45 mm' },
  { name: 'United Kingdom', flag: '🇬🇧', size: '35×45 mm' },
  { name: 'Canada', flag: '🇨🇦', size: '50×70 mm' },
  { name: 'Australia', flag: '🇦🇺', size: '35×45 mm' },
  { name: 'India', flag: '🇮🇳', size: '35×45 mm' },
  { name: 'China', flag: '🇨🇳', size: '33×48 mm' },
  { name: 'Japan', flag: '🇯🇵', size: '35×45 mm' },
  { name: 'Germany', flag: '🇩🇪', size: '35×45 mm' },
  { name: 'Tanzania', flag: '🇹🇿', size: '35×45 mm' },
  { name: 'Kenya', flag: '🇰🇪', size: '2×2 inches (51×51 mm)' },
  { name: 'Uganda', flag: '🇺🇬', size: '2×2 inches (51×51 mm)' },
  { name: 'Rwanda', flag: '🇷🇼', size: '40×40 mm' },
  { name: 'Burundi', flag: '🇧🇮', size: '2×2 inches (51×51 mm)' },
  { name: 'South Sudan', flag: '🇸🇸', size: '2×2 inches (51×51 mm)' },
]

const STEPS = [
  { title: 'Upload Your Photo', desc: 'Take a photo with your phone or webcam against any background. Supports JPG, PNG, and HEIC.' },
  { title: 'Select Document Type', desc: 'Choose your country and document type. We auto-apply the correct size, background color, and face positioning requirements.' },
  { title: 'AI Processing', desc: 'Our AI removes the background, detects your face, and auto-crops to official specifications — in under a minute.' },
  { title: 'Download for Free', desc: 'Download your compliant passport photo instantly. No watermark, no signup, no data stored.' },
]

const FAQS = [
  { q: 'Is Luta Studio really free?', a: 'Yes — 100% free with no watermarks, no signup, and unlimited usage. Luta Studio is open-source software.' },
  { q: 'Is my photo stored on your servers?', a: 'No. Your photo is processed and returned immediately. We do not store any images or personal data.' },
  { q: 'What size is a US passport photo?', a: 'A US passport photo must be 2×2 inches (51×51 mm). Luta Studio automatically crops to this exact specification.' },
  { q: 'Can I use this for visa applications?', a: 'Yes. Luta Studio supports passport and visa photo requirements for the US, UK, EU, Canada, Australia, India, China, Japan, and Germany.' },
  { q: 'What if the automatic crop is wrong?', a: 'You can use the manual crop tool to adjust the framing yourself after AI processing.' },
  { q: 'Do I need to remove the background myself?', a: 'No. Luta Studio uses AI to automatically remove the background and replace it with the correct color for your document type.' },
]

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 mx-auto max-w-6xl w-full px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Create Your Passport Photo Online for Free</h2>
          <p className="mt-1 text-gray-400 text-xs sm:text-sm">AI-powered background removal, face detection, and auto-cropping — no signup required</p>
        </div>

        <PhotoTool />
      </div>
    </div>
  )
}

import Link from 'next/link';

export default function Footer() {
  return (
    <div className="py-6 mt-4 text-center text-xs text-stone-400">
      Designed & Developed by <a href="https://dualsparkstudio.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-stone-500 hover:text-orange-500 underline underline-offset-2">DualSpark Studio</a>
    </div>
  );
}

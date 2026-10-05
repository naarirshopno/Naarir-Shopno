import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Phone, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const CustomerChatDrawer: React.FC = () => {
  const { isCustomerChatOpen, setIsCustomerChatOpen, sendCustomerMessage, settings } = useShop();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('পোশাকের সাইজ ও ফ্যাব্রিক তথ্য');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  if (!isCustomerChatOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('অনুগ্রহ করে নাম, মোবাইল নম্বর ও আপনার মেসেজটি পূরণ করুন');
      return;
    }

    sendCustomerMessage({
      name: name.trim(),
      phone: phone.trim(),
      subject,
      message: message.trim(),
    });

    setIsSent(true);
    setError('');
  };

  const resetAndClose = () => {
    setIsSent(false);
    setName('');
    setPhone('');
    setMessage('');
    setIsCustomerChatOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-rose-100 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-rose-700 via-pink-600 to-rose-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Hind_Siliguri']">নারীর স্বপ্ন হেল্পডেস্ক</h3>
              <p className="text-[11px] text-pink-200">আমরা সরাসরি অনলাইনে সক্রিয় আছি</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isSent ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">মেসেজ সফলভাবে পৌঁছেছে!</h4>
                <p className="text-xs text-slate-600">
                  ধন্যবাদ <strong>{name}</strong>। আপনার বার্তাটি আমাদের কাস্টমার সার্ভিস ইনবক্সে জমা হয়েছে। খুব শীঘ্রই আমাদের প্রতিনিধি আপনার নম্বরে যোগাযোগ করবেন।
                </p>
              </div>

              <div className="pt-4 flex flex-col gap-2 w-full">
                <button
                  onClick={() => setIsSent(false)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs py-2.5 rounded-xl transition"
                >
                  আরেকটি মেসেজ পাঠান
                </button>
                <button
                  onClick={resetAndClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Greeting note */}
              <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-rose-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <span>আসসালামু আলাইকুম!</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  পোশাকের সাইজ, ফেব্রিক, ডেলিভারি বা যেকোনো প্রশ্ন নিচে লিখে পাঠান। আমাদের টিম সরাসরি উত্তর দেবে।
                </p>
              </div>

              {/* Direct Instant Channels */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">অথবা সরাসরি তাৎক্ষণিক চ্যাট করুন:</p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://m.me/NaarirShopno"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition"
                  >
                    <svg className="w-4 h-4 fill-current text-blue-600" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>ফেসবুক মেসেঞ্জার</span>
                  </a>

                  <a
                    href={
                      settings.whatsappShortLink && settings.whatsappShortLink.trim()
                        ? (settings.whatsappShortLink.startsWith('http') ? settings.whatsappShortLink.trim() : `https://${settings.whatsappShortLink.trim()}`)
                        : `https://wa.me/${(settings.whatsappNumber || settings.hotline1 || '01911541717').replace(/[^0-9]/g, '')}?text=আসসালামু%20আলাইকুম,%20নারীর%20স্বপ্ন%20থেকে%20একটি%20পোশাক%20সম্পর্কে%20জানতে%20চাই।`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition"
                  >
                    <span>💬 হোয়াটসঅ্যাপ</span>
                  </a>
                </div>
              </div>

              {/* Form to submit direct message */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-700">মেসেজ ফর্ম:</p>
                {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">আপনার নাম *</label>
                  <input
                    id="input-chat-name"
                    type="text"
                    placeholder="আপনার পুরো নাম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">মোবাইল নাম্বার *</label>
                  <input
                    id="input-chat-phone"
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">বিষয়</label>
                  <select
                    id="select-chat-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="পোশাকের সাইজ ও ফ্যাব্রিক তথ্য">পোশাকের সাইজ ও ফ্যাব্রিক তথ্য</option>
                    <option value="ডেলিভারি সংক্রান্ত প্রশ্ন">ডেলিভারি সংক্রান্ত প্রশ্ন</option>
                    <option value="স্টক আছে কি না জানার জন্য">স্টক আছে কি না জানার জন্য</option>
                    <option value="রিটার্ন ও এক্সচেঞ্জ জিজ্ঞাসা">রিটার্ন ও এক্সচেঞ্জ জিজ্ঞাসা</option>
                    <option value="পাইকারি / হোলসেল ক্রয়">পাইকারি / হোলসেল ক্রয়</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">আপনার মেসেজ লিখুন *</label>
                  <textarea
                    id="textarea-chat-msg"
                    rows={4}
                    placeholder="আপনার প্রশ্ন বা পছন্দের প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <button
                  id="btn-submit-chat"
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>মেসেজ পাঠান</span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
          হটলাইনে তাৎক্ষণিক কথা বলুন: <strong className="text-rose-700">{settings.hotline1}</strong>
        </div>
      </div>
    </div>
  );
};

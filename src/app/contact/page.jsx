// linora-platform/frontend/src/app/contact/page.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  User,
  Mail,
  Send,
  Loader,
  Check,
  X,
} from "lucide-react";
import api from "../../lib/axios"; // استيراد المثيل الموحد api
import { toast } from "sonner"; // استخدام مكتبة التنبيهات لتحسين التجربة

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState(""); // '', 'sending', 'success', 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      // استخدام api.post بدلاً من fetch
      await api.post("/contact", formData);

      setStatus("success");
      toast.success("تم إرسال رسالتكِ بنجاح! 🌸");
      setFormData({ name: "", email: "", phone: "", message: "" });

    } catch (error) {
      console.error("Submit error:", error);
      setStatus("error");
      toast.error("حدث خطأ ما، تعذر إرسال الرسالة.");
    }
  };

  return (
    <div className="min-h-screen bg-pink-50/50" dir="rtl">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-100/30 to-transparent z-10" />
        <div className="container mx-auto px-4 relative z-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6"
          >
            تواصلي{" "}
            <span className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
              مع لينورا
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed"
          >
            سواء كان لديكِ استفسار، اقتراح، أو رغبة في التعاون، فريقنا النسائي جاهز للاستماع إليكِ.
          </motion.p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mx-auto px-4 pb-20 -mt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100"
        >
          <div className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  اسمكِ الكامل
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                    placeholder="أدخلي اسمكِ"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  بريدكِ الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                    placeholder="example@domain.com"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  رسالتكِ
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 right-3 text-gray-400">
                    <MessageSquare size={18} />
                  </div>
                  <textarea
                    name="message"
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                    className="w-full pr-10 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                    placeholder="اكتبي استفساركِ هنا..."
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-pink-500/30 disabled:opacity-70"
                >
                  {status === "sending" ? (
                    <>
                      <Loader className="animate-spin" size={20} /> جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send size={20} /> أرسلي الرسالة
                    </>
                  )}
                </button>
              </div>

              {/* Status Messages can be removed if using toast notifications */}
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
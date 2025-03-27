import { icons } from "@/assets/assets";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6">
      <motion.div
        className="max-w-3xl text-center bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1 className="text-5xl font-bold text-green-400 mb-6">Contact Us</h1>
        <p className="text-xl text-gray-300 mb-6">
          Have questions or want to collaborate? Feel free to reach out!
        </p>

        {/* Email */}
        <div className="flex md:ml-26 justify-center md:justify-self-start items-center space-x-4">
          <img src={icons.Envelope} width={60} />
          <a
            href="mailto:s.a.moizKhan988@gmail.com"
            className="text-gray-300 hover:text-white transition"
          >
            s.a.moizKhan988@gmail.com
          </a>
        </div>

        {/* GitHub */}
        <div className="flex md:ml-26 justify-center md:justify-self-start items-center mt-4 space-x-4">
          <img src={icons.GitHub} width={60} />
          <a
            href="https://github.com/iNsoM22/Dental-XRay-Segmentation"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition"
          >
            GitHub Repository
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;

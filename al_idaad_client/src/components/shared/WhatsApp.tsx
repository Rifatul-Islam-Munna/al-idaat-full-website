import icon from "@/assets/whatsapp.svg";
import Image from "next/image";

const WhatsApp = () => {
    return (
        <div className="w-20 h-20 fixed z-40 bottom-2 right-2 flex items-center justify-center">
            {/* Ripple rings */}
            <span className="absolute w-12 h-12 rounded-full bg-green-300 opacity-40 animate-ripple" />
            <span className="absolute w-12 h-12 rounded-full bg-green-300 opacity-20 animate-ripple [animation-delay:0.6s]" />
            <span className="absolute w-12 h-12 rounded-full bg-green-300 opacity-10 animate-ripple [animation-delay:1.2s]" />

            {/* Icon button */}
            <a
                href="https://wa.me/8801734874385"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 flex items-center justify-center w-12 h-12 bg-green-300/60 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
            >
                <Image src={icon} width={28} height={28} alt="whatsapp" />
            </a>
        </div>
    );
};

export default WhatsApp;

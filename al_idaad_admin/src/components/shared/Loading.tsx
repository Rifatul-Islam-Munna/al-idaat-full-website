import loading from "@/assets/loading.svg";
import Image from "next/image";

const Loading = () => {
    return (
        <div className="fixed top-0 left-0 right-0 h-screen z-50 flex justify-center items-center">
            <Image src={loading} alt="loading" width={100} height={100}></Image>
        </div>
    );
};

export default Loading;

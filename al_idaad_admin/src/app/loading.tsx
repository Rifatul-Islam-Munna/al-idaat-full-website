import Image from "next/image";
import loadingImg from "@/assets/loading.svg";

const loading = () => {
    return (
        <div className="fixed top-25 left-80 right-0 h-[calc(100vh-100px)] flex justify-center items-center">
            <Image src={loadingImg} alt="loading" width={100} height={100}></Image>
        </div>
    );
};

export default loading;

import Image from "next/image";
import loadingImg from "@/assets/loading.svg";

const loading = () => {
    return (
        <div className="h-screen flex justify-center items-center">
            <Image src={loadingImg} alt="loading" width={100} height={100}></Image>
        </div>
    );
};

export default loading;

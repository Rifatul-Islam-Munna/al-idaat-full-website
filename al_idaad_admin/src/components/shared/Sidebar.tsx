"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Icon imports
import dashboard from "@/assets/icons/dashboard.png";
import blog from "@/assets/icons/blog.png";
import offer from "@/assets/icons/offer.png";
import banner from "@/assets/icons/banner.png";
import gallery from "@/assets/icons/gallery.png";
import service from "@/assets/icons/service.png";
import order from "@/assets/icons/order.png";

const Sidebar = () => {
    const pathname = usePathname();

    const menu = [
        {
            name: "Dashboard",
            icon: dashboard,
            path: "/dashboard",
        },
        {
            name: "Banner",
            icon: banner,
            path: "/banner",
        },
        {
            name: "Blog",
            icon: blog,
            path: "/blog",
        },
        // {
        //     name: "Contact",
        //     icon: contact,
        //     path: "/contact",
        // },
        {
            name: "Gallery",
            icon: gallery,
            path: "/gallery",
        },
        {
            name: "Product",
            icon: service,
            path: "/product",
        },
        {
            name: "Order",
            icon: order,
            path: "/order",
        },
        {
            name: "Offer banner",
            icon: offer,
            path: "/offer-banner",
        },
    ];

    return (
        <aside>
            <div className="px-2 space-y-1 mt-25">
                {menu.map((item) => {
                    const isActive = pathname === item.path;

                    return (
                        <Link key={item.name} href={item.path} className="block">
                            <div
                                className={`flex items-center py-3 pl-8 gap-3 cursor-pointer transition rounded-md
                                ${isActive ? "bg-selected" : "hover:bg-selected"}`}
                            >
                                <Image src={item.icon} alt={item.name} width={20} height={20} className="object-contain" />

                                <p className="text-sm text-bg_secondary font-medium">{item.name}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
};

export default Sidebar;

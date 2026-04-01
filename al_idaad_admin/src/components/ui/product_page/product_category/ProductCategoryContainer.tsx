import AddProductCategory from "./AddProductCategory";

import { motion, Variants, Easing } from "motion/react";
import ProductCategoryDropdown from "./ProductCategoryDropdown";

// Parent container animation (with stagger)
const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
        },
    },
};

// Custom easing curve
const smoothEase: Easing = [0.22, 1, 0.36, 1];

// Children animation
const item: Variants = {
    hidden: { opacity: 0, x: -40 },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            ease: smoothEase, // ✅ cast easing properly
        },
    },
    exit: {
        opacity: 0,
        x: 40,
        transition: {
            duration: 0.4,
            ease: smoothEase,
        },
    },
};

const ProductCategoryContainer = () => {
    return (
        <motion.div variants={container} initial="hidden" animate="show" exit="exit" className="flex justify-between gap-4">
            <motion.div variants={item} className="flex-1 overflow-y-auto h-[calc(100vh-202px)] custom-scrollbar">
                <AddProductCategory></AddProductCategory>
            </motion.div>

            <motion.div variants={item} className="flex-1 overflow-y-auto h-[calc(100vh-202px)] custom-scrollbar">
                <ProductCategoryDropdown></ProductCategoryDropdown>
            </motion.div>
        </motion.div>
    );
};

export default ProductCategoryContainer;

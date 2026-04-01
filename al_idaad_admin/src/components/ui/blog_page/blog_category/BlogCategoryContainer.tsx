import AddBlogCategory from "./AddBlogCategory";
import BlogCategoryDropdown from "./BlogCategoryDropdown";

import { motion, Variants, Easing } from "motion/react";

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

const BlogCategoryContainer = () => {
    return (
        <motion.div variants={container} initial="hidden" animate="show" exit="exit" className="flex justify-between gap-4">
            <motion.div variants={item} className="flex-1">
                <AddBlogCategory></AddBlogCategory>
            </motion.div>

            <motion.div variants={item} className="flex-1">
                <BlogCategoryDropdown></BlogCategoryDropdown>
            </motion.div>
        </motion.div>
    );
};

export default BlogCategoryContainer;

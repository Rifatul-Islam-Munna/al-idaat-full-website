"use client";

import { useAuth } from "@/components/shared/AuthContext";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import toast from "react-hot-toast";
import { FiHeart } from "react-icons/fi";

type WishlistButtonProps = {
  productId: string;
  className?: string;
  iconSize?: number;
  label?: string;
};

const WishlistButton = ({
  productId,
  className = "",
  iconSize = 18,
  label,
}: WishlistButtonProps) => {
  const router = useRouter();
  const { user, toggleWishlist, isInWishlist } = useAuth();
  const [pending, setPending] = useState(false);

  const inWishlist = isInWishlist(productId);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast("Please log in to save products to your wishlist.");
      router.push("/login");
      return;
    }

    if (pending) return;

    setPending(true);

    try {
      const result = await toggleWishlist(productId);

      if (!result.success) {
        toast.error(result.message || "Wishlist update failed");
        return;
      }

      toast.success(result.inWishlist ? "Added to wishlist" : "Removed from wishlist");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={className}
      disabled={pending}
    >
      {pending ? (
        <span className="block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <span className="inline-flex items-center gap-2">
          <FiHeart
            size={iconSize}
            className={inWishlist ? "fill-current" : ""}
          />
          {label ? <span>{label}</span> : null}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;

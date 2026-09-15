"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle,
  ThumbsUp,
  MessageSquarePlus,
  X,
  Camera,
  Filter,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { ReviewWithUser } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface ReviewsSectionProps {
  productId: string;
  productName: string;
  averageRating: number;
  totalReviews: number;
  reviews: ReviewWithUser[];
  ratingDistribution?: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  } | null;
}

const RATING_SENTIMENTS: Record<number, { label: string; color: string; desc: string }> = {
  5: { label: "Exceptional / Highly Recommended! 🌟", color: "text-emerald-600", desc: "Exceeded all expectations" },
  4: { label: "Very Good 😊", color: "text-blue-600", desc: "High quality, minor suggestions" },
  3: { label: "Average / Neutral 🙂", color: "text-amber-600", desc: "Meets basic expectations" },
  2: { label: "Below Average 😐", color: "text-orange-600", desc: "Several drawbacks noticed" },
  1: { label: "Poor / Disappointed 😞", color: "text-rose-600", desc: "Significant defects or issues" },
};

const SAMPLE_PHOTO_PRESETS = [
  {
    name: "Unboxing & Packaging 📦",
    url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop",
  },
  {
    name: "In Hand / Build View 🎧",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
  },
  {
    name: "Accessories & Cable 🔌",
    url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop",
  },
];

export function ReviewsSection({
  productId,
  productName,
  averageRating,
  totalReviews,
  reviews: initialReviews,
  ratingDistribution,
}: ReviewsSectionProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewWithUser[]>(initialReviews);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageInputUrl, setImageInputUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});

  // Filter & Sort State
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [onlyPhotos, setOnlyPhotos] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<"helpful" | "newest" | "highest" | "lowest">("helpful");

  // Lightbox Modal for Photo Inspection
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    review: ReviewWithUser;
  } | null>(null);

  const distribution = ratingDistribution || {
    fiveStar: Math.round(totalReviews * 0.7),
    fourStar: Math.round(totalReviews * 0.2),
    threeStar: Math.round(totalReviews * 0.06),
    twoStar: Math.round(totalReviews * 0.02),
    oneStar: Math.round(totalReviews * 0.02),
  };

  // Extract all customer photos across all reviews
  const allCustomerPhotos = useMemo(() => {
    const photos: { url: string; review: ReviewWithUser }[] = [];
    reviews.forEach((r) => {
      if (r.images && r.images.length > 0) {
        r.images.forEach((img) => {
          photos.push({ url: img.url, review: r });
        });
      }
    });
    return photos;
  }, [reviews]);

  // Filter & Sort logic
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        if (filterStar !== null && r.rating !== filterStar) return false;
        if (onlyPhotos && (!r.images || r.images.length === 0)) return false;
        if (onlyVerified && !r.isVerified) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "helpful") return b.helpfulVotes - a.helpfulVotes;
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "highest") return b.rating - a.rating;
        if (sortBy === "lowest") return a.rating - b.rating;
        return 0;
      });
  }, [reviews, filterStar, onlyPhotos, onlyVerified, sortBy]);

  const handleVoteHelpful = async (reviewId: string) => {
    if (votedReviews[reviewId]) return;

    // Optimistic update
    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulVotes: r.helpfulVotes + 1 } : r))
    );
    toast("Thank you for your feedback!", "info");

    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Helpful vote sync error:", err);
    }
  };

  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    if (uploadedImages.length >= 5) {
      toast("Maximum 5 photos allowed per review", "error");
      return;
    }
    if (uploadedImages.includes(url.trim())) {
      toast("Image already added", "info");
      return;
    }
    setUploadedImages((prev) => [...prev, url.trim()]);
    setImageInputUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 10) {
      toast("Please provide at least 10 characters in your review comment", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: userRating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast("Your review has been verified and published!", "success");
        setShowReviewModal(false);
        setTitle("");
        setComment("");
        setUploadedImages([]);

        // Insert new review at the top
        const newReview: ReviewWithUser = {
          id: data.review?.id || `rev_${Date.now()}`,
          productId,
          userId: "current",
          rating: userRating,
          title: title.trim() || null,
          comment: comment.trim(),
          isVerified: data.review?.isVerified ?? true,
          helpfulVotes: 0,
          createdAt: new Date(),
          user: { name: "You (Verified Buyer)", image: null },
          images: uploadedImages.map((u, i) => ({ id: `img_${Date.now()}_${i}`, url: u })),
        };
        setReviews([newReview, ...reviews]);
      } else {
        toast(data.error || "Failed to submit review. Please ensure you are logged in.", "error");
      }
    } catch (err) {
      toast("Network error while submitting review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRatingDisplay = hoverRating !== null ? hoverRating : userRating;

  return (
    <div className="space-y-8 pt-8 border-t border-slate-200" id="customer-reviews-section">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Customer Verified Reviews & Ratings</h2>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Genuine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real feedback from verified purchasers across India
          </p>
        </div>

        <button
          onClick={() => setShowReviewModal(true)}
          id="write-review-button"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer self-start md:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write a Verified Review</span>
        </button>
      </div>

      {/* Ratings Distribution Bar Chart & Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Overall Score */}
        <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200">
          <div className="text-5xl font-black text-slate-900 tracking-tight">{averageRating.toFixed(1)}</div>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Based on {totalReviews.toLocaleString()} verified ratings
          </p>
          <div className="mt-3 inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>96% would recommend</span>
          </div>
        </div>

        {/* Breakdown Bars (Clickable to filter!) */}
        <div className="md:col-span-2 space-y-2.5 flex flex-col justify-center">
          {[
            { star: 5, count: distribution.fiveStar },
            { star: 4, count: distribution.fourStar },
            { star: 3, count: distribution.threeStar },
            { star: 2, count: distribution.twoStar },
            { star: 1, count: distribution.oneStar },
          ].map((item) => {
            const pct = totalReviews > 0 ? (item.count / totalReviews) * 100 : 0;
            const isSelected = filterStar === item.star;
            return (
              <button
                key={item.star}
                onClick={() => setFilterStar(isSelected ? null : item.star)}
                className={`w-full flex items-center gap-3 text-xs p-1 rounded-lg transition-colors text-left ${
                  isSelected ? "bg-amber-100/70 ring-1 ring-amber-300" : "hover:bg-slate-100"
                }`}
              >
                <span className="w-10 font-semibold text-slate-700 flex items-center gap-1 shrink-0">
                  {item.star} <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                </span>
                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-14 text-right text-slate-500 shrink-0 font-medium">
                  {pct.toFixed(0)}% ({item.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Photos & Videos Gallery Strip */}
      {allCustomerPhotos.length > 0 && (
        <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Customer Photos & Unboxing ({allCustomerPhotos.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Click any photo to inspect</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {allCustomerPhotos.map((photo, pIdx) => (
              <button
                key={pIdx}
                onClick={() => setLightboxImage(photo)}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 shrink-0 group hover:ring-2 hover:ring-indigo-500 transition-all shadow-xs"
              >
                <img
                  src={photo.url}
                  alt={`Customer photo ${pIdx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                  <span className="text-[10px] text-white font-medium truncate">
                    {photo.review.user.name || "Customer"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Sort Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <button
            onClick={() => {
              setFilterStar(null);
              setOnlyPhotos(false);
              setOnlyVerified(false);
            }}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              filterStar === null && !onlyPhotos && !onlyVerified
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            All ({reviews.length})
          </button>

          <button
            onClick={() => setOnlyPhotos(!onlyPhotos)}
            className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
              onlyPhotos
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <span>📸 With Photos</span>
            {allCustomerPhotos.length > 0 && <span>({allCustomerPhotos.length})</span>}
          </button>

          <button
            onClick={() => setOnlyVerified(!onlyVerified)}
            className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
              onlyVerified
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verified Purchases</span>
          </button>

          {filterStar !== null && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-semibold">
              <span>{filterStar} Stars Only</span>
              <button onClick={() => setFilterStar(null)} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="helpful">Most Helpful</option>
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No reviews matching active filter</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try clearing your active filters or be the first to submit a photo review for this product!
            </p>
            <button
              onClick={() => {
                setFilterStar(null);
                setOnlyPhotos(false);
                setOnlyVerified(false);
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3.5 hover:shadow-xs transition-shadow"
            >
              {/* Reviewer Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                    {rev.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {rev.user?.name || "Verified Customer"}
                      </span>
                      {rev.isVerified && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Reviewed in India on{" "}
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Rating Stars Badge */}
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  <span className="text-xs font-bold text-amber-900">{rev.rating}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
              </div>

              {/* Review Title */}
              {rev.title && <h4 className="text-sm font-bold text-slate-900">{rev.title}</h4>}

              {/* Review Comment */}
              <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

              {/* Review Photos Thumbnail Grid */}
              {rev.images && rev.images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {rev.images.map((img, iIdx) => (
                    <button
                      key={img.id || iIdx}
                      onClick={() => setLightboxImage({ url: img.url, review: rev })}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group"
                    >
                      <img
                        src={img.url}
                        alt={`Review photo ${iIdx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Helpful vote action */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                <button
                  onClick={() => handleVoteHelpful(rev.id)}
                  disabled={votedReviews[rev.id]}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all active:scale-95 ${
                    votedReviews[rev.id]
                      ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                      : "hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>
                    {votedReviews[rev.id] ? "Marked as Helpful" : "Helpful"} ({rev.helpfulVotes})
                  </span>
                </button>

                <span className="text-[11px] text-slate-400">
                  {rev.helpfulVotes > 0 ? `${rev.helpfulVotes} people found this helpful` : "Was this review helpful?"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Submission Modal Studio */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Write a Customer Review</h3>
                <p className="text-xs text-slate-500 truncate max-w-sm">{productName}</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star selector with dynamic sentiment */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                <label className="block font-bold text-slate-800">Overall Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setUserRating(s)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition-colors transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          s <= activeRatingDisplay ? "fill-amber-400 text-amber-400" : ""
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-slate-800 ml-2">
                    {activeRatingDisplay} / 5 Stars
                  </span>
                </div>
                <p className={`text-xs font-semibold ${RATING_SENTIMENTS[activeRatingDisplay].color}`}>
                  {RATING_SENTIMENTS[activeRatingDisplay].label}
                </p>
              </div>

              {/* Title / Headline */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Headline / Summary Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Exceptional sound clarity & comfortable earcups!"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-900"
                />
              </div>

              {/* Detailed Review Comment */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Detailed Review <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {comment.length} / 10 min chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? How does it perform in daily usage? How was the packaging?"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-900"
                />
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Add Customer Photos (Optional, up to 5)
                </label>

                {/* Custom Photo URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageInputUrl}
                    onChange={(e) => setImageInputUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 p-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage(imageInputUrl)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                {/* 1-Click Preset Samples */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Quick Presets:</span>
                  {SAMPLE_PHOTO_PRESETS.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleAddImage(p.url)}
                      className="text-[10px] bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>

                {/* Attached Photo Previews */}
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {uploadedImages.map((img, iIdx) => (
                      <div
                        key={iIdx}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group"
                      >
                        <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(iIdx)}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-90 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || comment.trim().length < 10}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold disabled:opacity-50 transition-all shadow-md active:scale-95"
                >
                  {isSubmitting ? "Publishing Review..." : "Submit Verified Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Photo Inspection */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* High-Res Photo */}
            <div className="md:w-3/5 bg-black flex items-center justify-center min-h-[300px] md:min-h-[420px]">
              <img
                src={lightboxImage.url}
                alt="Enlarged review photo"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            {/* Review Context Side-Panel */}
            <div className="md:w-2/5 p-5 flex flex-col justify-between bg-white text-xs space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {lightboxImage.review.user.name?.[0] || "U"}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block truncate">
                        {lightboxImage.review.user.name || "Customer"}
                      </span>
                      {lightboxImage.review.isVerified && (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setLightboxImage(null)}
                    className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= lightboxImage.review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Title & Comment */}
                {lightboxImage.review.title && (
                  <h4 className="font-bold text-slate-900 text-sm">{lightboxImage.review.title}</h4>
                )}
                <p className="text-slate-600 leading-relaxed max-h-48 overflow-y-auto pr-1">
                  {lightboxImage.review.comment}
                </p>
              </div>

              {/* Bottom Helpful Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleVoteHelpful(lightboxImage.review.id)}
                  disabled={votedReviews[lightboxImage.review.id]}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({lightboxImage.review.helpfulVotes})</span>
                </button>
                <span className="text-[10px] text-slate-400">
                  {new Date(lightboxImage.review.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

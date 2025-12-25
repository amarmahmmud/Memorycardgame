import { motion } from "motion/react";

interface MemoryCardProps {
  id: string;
  content: string;
  isImage?: boolean;
  imageUrl?: string | null;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export function MemoryCard({
  content,
  isImage,
  imageUrl,
  isFlipped,
  isMatched,
  onClick,
}: MemoryCardProps) {
  return (
    <motion.div
      className="relative w-full aspect-square cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: isFlipped || isMatched ? 1 : 1.05 }}
      whileTap={{ scale: isFlipped || isMatched ? 1 : 0.95 }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card Back */}
        <div
          className="absolute inset-0 rounded-xl shadow-lg flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          }}
        >
          <div className="text-4xl">?</div>
        </div>

        {/* Card Front */}
        <div
          className="absolute inset-0 rounded-xl bg-white shadow-lg flex items-center justify-center p-4"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {isImage && imageUrl ? (
            <img
              src={imageUrl}
              alt="Card content"
              className="w-full h-full object-contain rounded"
            />
          ) : (
            <div className="text-2xl md:text-3xl font-bold text-gray-800 text-center break-words">
              {content}
            </div>
          )}
        </div>
      </motion.div>

      {/* Matched overlay */}
      {isMatched && (
        <motion.div
          className="absolute inset-0 bg-green-500/20 rounded-xl border-4 border-green-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
    </motion.div>
  );
}

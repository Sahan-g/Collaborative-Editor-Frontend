import React from "react";
import clsx from "clsx";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import StarIcon from "@mui/icons-material/Star";
import ShareIcon from "@mui/icons-material/Share";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import EditNoteIcon from "@mui/icons-material/EditNote";

export interface DocumentCardProps {
  id: string;
  title: string;
  time: string;
  collaborators: number;
  isFavorite?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  onShare?: (id: string) => void;
  className?: string; // ✅ allow external styles
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  title,
  time,
  collaborators,
  isFavorite = false,
  isActive = false,
  onClick,
  onShare,
  className,
}) => {
  const containerClass = clsx(
    // fill grid cell nicely
    "w-full h-full",
    // visuals
    "border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition",
    className
  );

  return (
    <div
      className={containerClass}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
      role="button"
      aria-label={`Open ${title}`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="text-purple-600">
          <InsertDriveFileOutlinedIcon />
        </div>

        <div className="flex gap-1.5 text-gray-400">
          {isFavorite ? (
            <StarIcon fontSize="small" className="text-yellow-300" />
          ) : (
            <StarIcon fontSize="small" className="text-gray-300" />
          )}

          {/* Share button – stop propagation so card onClick doesn’t fire */}
          <button
            type="button"
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Share"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(id);
            }}
          >
            <ShareIcon fontSize="small" />
          </button>
        </div>
      </div>

      <h2 className="text-md font-semibold text-gray-900 mb-2">{title}</h2>

      <div className="flex items-center text-sm text-gray-500 mb-1">
        <AccessTimeIcon fontSize="small" className="mr-1" />
        <span>{time}</span>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center">
          <GroupIcon fontSize="small" className="mr-1" />
          <span>
            {collaborators} collaborator{collaborators !== 1 && "s"}
          </span>
        </div>

        {isActive && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-gray-700 bg-gray-100">
            <EditNoteIcon fontSize="small" /> Active
          </span>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
import React from "react";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import StarIcon from "@mui/icons-material/Star";
import ShareIcon from "@mui/icons-material/Share";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import EditNoteIcon from "@mui/icons-material/EditNote";

interface DocumentCardProps {
  title: string;
  time: string;
  collaborators: number;
  isFavorite?: boolean;
  isActive?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  time,
  collaborators,
  isFavorite = false,
  isActive = false,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white w-full max-w-sm shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-center mb-2">
        <div className="text-purple-600">
          <InsertDriveFileOutlinedIcon />
        </div>
        <div className="flex gap-2 text-gray-400">
          {isFavorite ? (
            <StarIcon fontSize="small" className="text-yellow-300" />
          ) : (
            <StarIcon
              fontSize="small"
              className="text-gray-300 hover:text-yellow-200"
            />
          )}
          {<ShareIcon fontSize="small" />}
        </div>
      </div>
      <h2 className="text-md font-semibold text-gray-900 mb-2">{title}</h2>
      <div className="flex items-center text-sm text-gray-500 mb-1">
        <AccessTimeIcon fontSize="small" className="mr-1" />
        <span>{time}</span>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
        <div className="flex items-center">
          <GroupIcon fontSize="small" className="mr-1" />
          <span>
            {collaborators} collaborator{collaborators !== 1 && "s"}
          </span>
        </div>

        {isActive && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-gray-700 bg-gray-100">
            <EditNoteIcon fontSize="small" /> Active
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;

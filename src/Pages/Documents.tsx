import ActionCard from "../Components/ActionCard";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import DocumentCard from "../Components/DocumentCard";

const documentCards = [
  {
    title: "Project Proposal 2024",
    time: "2 hours ago",
    collaborators: 3,
    isFavorite: true,
    isShared: true,
    isActive: true,
  },
  {
    title: "Team Meeting Notes",
    time: "5 hours ago",
    collaborators: 5,
    isShared: true,
    isActive: true,
  },
  {
    title: "Product Roadmap",
    time: "1 day ago",
    collaborators: 2,
    isFavorite: true,
    isActive: true,
  },
  {
    title: "Marketing Strategy",
    time: "3 days ago",
    collaborators: 4,
    isShared: true,
    isActive: true,
  },
];

const Documents = () => {
  return (
    <>
      <div className="flex justify-center pt-16 px-4">
        <div className="w-full max-w-screen-lg">
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, John
          </h1>
          <p className="text-sm text-gray-500">
            Continue where you left off or start something new
          </p>
        </div>
      </div>

      <div className="flex justify-center pt-16 px-4">
        <div className="w-full max-w-screen-lg">
          <div className="flex flex-wrap  gap-y-6 md:justify-start  lg:justify-between">
            {/* ActionCards */}
            <ActionCard
              title="New Document"
              subtitle="Start writing together"
              icon={AddOutlinedIcon}
              borderColor="gray-300"
            />
            <ActionCard
              title="Join Session"
              subtitle="Collaborate in real-time"
              icon={PeopleAltOutlinedIcon}
              borderColor="gray-300"
            />
            <ActionCard
              title="Browse Templates"
              subtitle="Get started quickly"
              icon={ArticleOutlinedIcon}
              borderColor="gray-300"
            />
          </div>
          <h2 className="text-xl font-semibold mt-12 mb-6 text-gray-800">
            Recent documents
          </h2>

          {/* Document Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentCards.map((doc, index) => (
              <DocumentCard key={index} {...doc} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Documents;

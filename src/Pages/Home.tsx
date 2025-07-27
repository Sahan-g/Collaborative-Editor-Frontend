import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to Collaborative Editor</h1>
        <p>You have successfully logged in!</p>
        <div className="home-actions">
          <button className="home-btn">Create New Document</button>
          <button className="home-btn secondary">View Documents</button>
        </div>
      </div>
    </div>
  );
};

export default Home;

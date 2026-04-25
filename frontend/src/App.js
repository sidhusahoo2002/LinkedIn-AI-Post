import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const API = "https://linkedin-ai-post-zjo5.onrender.com/";

const scoreLabels = [
  ["hook", "Hook"],
  ["readability", "Readability"],
  ["curiosity", "Curiosity"],
  ["personal", "Personal"],
  ["total", "Overall"]
];

function formatPercent(value) {
  return `${((value || 0) * 100).toFixed(1)}%`;
}

function formatPost(content) {
  return (content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function App() {
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [chosenPostIndex, setChosenPostIndex] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePostAction, setActivePostAction] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const selectedPost = selected !== null ? posts[selected] : null;
  const selectedPostLines = selectedPost ? formatPost(selectedPost.content) : [];
  const chosenPost = chosenPostIndex !== null ? posts[chosenPostIndex] : null;

  const goToPreviousPost = () => {
    if (!posts.length) {
      return;
    }

    setSelected((current) => {
      if (current === null) {
        return 0;
      }

      return current === 0 ? posts.length - 1 : current - 1;
    });
  };

  const goToNextPost = () => {
    if (!posts.length) {
      return;
    }

    setSelected((current) => {
      if (current === null) {
        return 0;
      }

      return current === posts.length - 1 ? 0 : current + 1;
    });
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
      setFeedback("Could not load analytics. Make sure the backend is running.");
    }
  };

  const generate = async () => {
    setIsGenerating(true);
    setFeedback("");

    try {
      const res = await axios.get(`${API}/generate-multiple`);

      if (res.data.error) {
        setPosts([]);
        setSelected(null);
        setChosenPostIndex(null);
        setFeedback(res.data.error);
        return;
      }

      const nextPosts = res.data.posts || [];
      setPosts(nextPosts);
      setSelected(nextPosts.length ? 0 : null);
      setChosenPostIndex(null);
      setFeedback(
        nextPosts.length
          ? "Fresh post ideas are ready. Browse them and choose one draft to post."
          : "No posts were returned."
      );
    } catch (err) {
      console.error(err);
      setFeedback("Server error. Check whether the backend is running on port 5000.");
    } finally {
      setIsGenerating(false);
    }
  };

  const approve = async () => {
    if (!chosenPost) {
      setFeedback("Choose one draft for posting before approving it.");
      return;
    }

    setActivePostAction(`approve-${chosenPostIndex}`);

    try {
      await axios.post(`${API}/approve`, {
        content: chosenPost.content
      });
      setFeedback(`Draft ${chosenPostIndex + 1} approved. You can publish it now.`);
    } catch (err) {
      console.error(err);
      setFeedback("Could not approve the selected post.");
    } finally {
      setActivePostAction(null);
    }
  };

  const post = async () => {
    setIsPosting(true);

    try {
      await axios.post(`${API}/post`);
      setFeedback("Post published and analytics refreshed.");
      await fetchAnalytics();
    } catch (err) {
      console.error(err);
      setFeedback(err.response?.data?.error || "Posting failed.");
    } finally {
      setIsPosting(false);
    }
  };

  const improve = async (index) => {
    setActivePostAction(`improve-${index}`);
    setFeedback("");

    try {
      const res = await axios.post(`${API}/improve`, {
        content: posts[index].content
      });

      setPosts((currentPosts) =>
        currentPosts.map((postItem, postIndex) =>
          postIndex === index
            ? { ...postItem, content: res.data.improved }
            : postItem
        )
      );

      setFeedback("That post has been refined for stronger readability and hook.");
    } catch (err) {
      console.error(err);
      setFeedback("Could not improve that post right now.");
    } finally {
      setActivePostAction(null);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const chartData = {
    labels: analytics.map((_, index) => `Post ${index + 1}`),
    datasets: [
      {
        label: "Engagement %",
        data: analytics.map((entry) => Number(((entry.engagement || 0) * 100).toFixed(2))),
        borderColor: "#1f6feb",
        backgroundColor: "rgba(31, 111, 235, 0.16)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          callback: (value) => `${value}%`
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="app-shell">
      <div className="app-background" />

      <main className="dashboard">
        <section className="hero-card">
          <div className="hero-copy">
            <span className="eyebrow">LinkedIn AI Agent</span>
            <h1>Readable post drafts, faster reviews, and a cleaner publishing flow.</h1>
            <p>
              Generate post options, compare their writing quality, improve the one you
              like, then approve and publish with confidence.
            </p>
          </div>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={generate}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate New Posts"}
            </button>

            <button
              className="secondary-button"
              onClick={approve}
              disabled={!selectedPost || activePostAction !== null}
            >
              {activePostAction?.startsWith("approve") ? "Approving..." : "Approve Selected"}
            </button>

            <button
              className="secondary-button"
              onClick={post}
              disabled={isPosting}
            >
              {isPosting ? "Posting..." : "Publish Approved Post"}
            </button>
          </div>
        </section>

        {feedback ? <div className="feedback-banner">{feedback}</div> : null}

        <section className="content-grid">
          <div className="panel">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Generated drafts</span>
                <h2>Choose the clearest post</h2>
              </div>
              <span className="count-chip">{posts.length} drafts</span>
            </div>

            {posts.length ? (
              <div className="post-carousel">
                <div className="carousel-stage">
                  <button
                    className="carousel-arrow"
                    onClick={goToPreviousPost}
                    aria-label="Show previous draft"
                  >
                    &#8592;
                  </button>

                  <article className="post-card selected floating-card">
                    <div className="post-card-header">
                      <div>
                        <span className="post-label">Draft {(selected || 0) + 1}</span>
                        <h3>Featured draft for review</h3>
                      </div>
                      <span className="score-pill">
                        Score {selectedPost?.score?.total ?? 0}/10
                      </span>
                    </div>

                    <div className="score-grid">
                      {scoreLabels.map(([key, label]) => (
                        <div key={key} className="score-stat">
                          <span>{label}</span>
                          <strong>{selectedPost?.score?.[key] ?? 0}/10</strong>
                        </div>
                      ))}
                    </div>

                    <div className="post-preview floating-preview">
                      {selectedPostLines.map((line, lineIndex) => (
                        <p key={`${selected}-${lineIndex}`}>{line}</p>
                      ))}
                    </div>

                    <div className="post-actions">
                      <button
                        className={
                          chosenPostIndex === selected
                            ? "ghost-button chosen-button"
                            : "ghost-button"
                        }
                        onClick={() => {
                          setChosenPostIndex(selected);
                          setFeedback(`Draft ${selected + 1} is now the only selected post for publishing.`);
                        }}
                      >
                        {chosenPostIndex === selected
                          ? "Chosen For Posting"
                          : "Choose This Draft"}
                      </button>

                      <button className="ghost-button selected-button">
                        Viewing Draft
                      </button>

                      <button
                        className="ghost-button"
                        onClick={() => improve(selected)}
                        disabled={activePostAction !== null}
                      >
                        {activePostAction === `improve-${selected}`
                          ? "Improving..."
                          : "Improve Writing"}
                      </button>
                    </div>
                  </article>

                  <button
                    className="carousel-arrow"
                    onClick={goToNextPost}
                    aria-label="Show next draft"
                  >
                    &#8594;
                  </button>
                </div>

                <div className="carousel-footer">
                  <div className="carousel-progress">
                    <span>Viewing draft {(selected || 0) + 1}</span>
                    <span>
                      {chosenPostIndex !== null
                        ? `Chosen draft ${chosenPostIndex + 1}`
                        : "No draft chosen yet"}
                    </span>
                    <span>{posts.length} total</span>
                  </div>

                  <div className="carousel-dots">
                    {posts.map((_, index) => (
                      <button
                        key={index}
                        className={`carousel-dot${selected === index ? " active" : ""}`}
                        onClick={() => setSelected(index)}
                        aria-label={`Go to draft ${index + 1}`}
                      >
                        <span>{index + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <h3>No drafts yet</h3>
                <p>Generate posts to see polished, readable preview cards here.</p>
              </div>
            )}
          </div>

          <div className="sidebar">
            <section className="panel analytics-panel">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Performance</span>
                  <h2>Engagement trend</h2>
                </div>
              </div>

              <div className="chart-wrap">
                {analytics.length ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="empty-chart">
                    Publish an approved post to start building analytics.
                  </div>
                )}
              </div>
            </section>

            <section className="panel analytics-panel">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Published posts</span>
                  <h2>Recent results</h2>
                </div>
              </div>

              {analytics.length ? (
                <div className="analytics-list">
                  {analytics.map((entry) => (
                    <article key={entry.id} className="analytics-card">
                      <div className="analytics-card-header">
                        <strong>{formatPercent(entry.engagement)} engagement</strong>
                        <span>{entry.metrics?.impressions || 0} impressions</span>
                      </div>

                      <p>{entry.content}</p>

                      <div className="analytics-meta">
                        <span>{entry.metrics?.likes || 0} likes</span>
                        <span>{entry.metrics?.comments || 0} comments</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state compact">
                  <h3>No analytics yet</h3>
                  <p>Your posted drafts will appear here with engagement details.</p>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

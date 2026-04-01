import { useState, useEffect, useRef } from "react";

const FILTERS = ["all", "active", "done"];

const CATEGORIES = [
  { id: "study", label: "✏️ study", color: "#b5a9f5", bg: "#f0eeff" },
  { id: "self-care", label: "🌸 self-care", color: "#f5a9c8", bg: "#fff0f6" },
  { id: "errands", label: "🛍️ errands", color: "#f5c9a9", bg: "#fff7f0" },
];

function getCat(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

function getInitialTodos() {
  return [
    { id: 1, text: "Finish my notes for tomorrow 📖", done: true, cat: "study" },
    { id: 2, text: "Do a 10-min skincare routine", done: false, cat: "self-care" },
    { id: 3, text: "Pick up boba on the way home 🧋", done: false, cat: "errands" },
    { id: 4, text: "Revise chapter 3 before dinner", done: false, cat: "study" },
  ];
}

export default function TodoApp() {
  const [todos, setTodos] = useState(getInitialTodos);
  const [input, setInput] = useState("");
  const [cat, setCat] = useState("study");
  const [filter, setFilter] = useState("all");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef(null);
  const nextId = useRef(100);

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const doneCount = todos.filter((t) => t.done).length;
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [...prev, { id: nextId.current++, text, done: false, cat }]);
    setInput("");
    inputRef.current?.focus();
  }

  function toggleDone(id) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(todo) {
    setEditId(todo.id);
    setEditText(todo.text);
  }

  function saveEdit(id) {
    const text = editText.trim();
    if (!text) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
    setEditId(null);
  }

  function clearDone() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fef6fb 0%, #f0f4ff 50%, #fdf7ef 100%)",
      fontFamily: "'Nunito', sans-serif",
      padding: "2rem 1rem",
      position: "relative",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap" rel="stylesheet" />

      {/* Decorative blobs */}
      <div style={{ position: "fixed", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "#fce4f5", opacity: 0.5, zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "#dde8ff", opacity: 0.5, zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "40%", left: -40, width: 130, height: 130, borderRadius: "50%", background: "#ffecd2", opacity: 0.45, zIndex: 0, pointerEvents: "none" }} />

      <style>{`
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .todo-item { animation: floatIn 0.3s ease both; }
        .todo-item:hover .item-actions { opacity: 1 !important; }
        .cat-btn:hover { transform: translateY(-1px); }
        .add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px #f5a9c855; }
        .check-btn:active { animation: checkPop 0.25s ease; }
        input::placeholder { color: #c9b8d8; }
        input:focus { outline: none; }
      `}</style>

      <div style={{ maxWidth: 520, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 13, color: "#c9a8e0", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>
            ✦ my little planner ✦
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 42,
            margin: 0,
            background: "linear-gradient(135deg, #d4a8f0, #f5a9c8, #f5c9a9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.1,
          }}>
            Today's Tasks
          </h1>
          <div style={{ color: "#c9b8d8", fontSize: 13, marginTop: 6 }}>
            {doneCount} of {todos.length} completed 🌷
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: "#f0e8f8", borderRadius: 99, height: 8, marginBottom: 24, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #d4a8f0, #f5a9c8)",
            borderRadius: 99,
            transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>

        {/* Input card */}
        <div style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(10px)",
          borderRadius: 20,
          padding: "18px 20px",
          border: "1.5px solid #f0e0f8",
          marginBottom: 14,
          boxShadow: "0 4px 24px #f0d8f818",
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="add something cute to do… 🌸"
            style={{
              width: "100%",
              border: "none",
              background: "none",
              color: "#5a4a6a",
              fontSize: 15,
              fontFamily: "inherit",
              fontWeight: 500,
              marginBottom: 14,
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className="cat-btn"
                onClick={() => setCat(c.id)}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  padding: "5px 12px",
                  borderRadius: 99,
                  border: cat === c.id ? `2px solid ${c.color}` : "2px solid #ede8f5",
                  background: cat === c.id ? c.bg : "transparent",
                  color: cat === c.id ? c.color : "#b8aac8",
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
              >
                {c.label}
              </button>
            ))}
            <button
              className="add-btn"
              onClick={addTodo}
              style={{
                marginLeft: "auto",
                background: "linear-gradient(135deg, #e8b4f5, #f5a9c8)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "8px 20px",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.18s",
                boxShadow: "0 4px 14px #f5a9c840",
                letterSpacing: "0.3px",
              }}
            >
              + add ✦
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, alignItems: "center" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "rgba(255,255,255,0.9)" : "transparent",
                border: filter === f ? "1.5px solid #f0d8f8" : "1.5px solid transparent",
                color: filter === f ? "#c48ae8" : "#b8aac8",
                borderRadius: 10,
                padding: "5px 14px",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.15s",
                boxShadow: filter === f ? "0 2px 10px #e8b4f520" : "none",
              }}
            >
              {f === "all" ? "🎀 all" : f === "active" ? "🌷 active" : "✅ done"}
            </button>
          ))}
          {doneCount > 0 && (
            <button
              onClick={clearDone}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: "#e8a0b4",
                fontSize: 12,
                fontFamily: "inherit",
                fontWeight: 700,
                cursor: "pointer",
                padding: "5px 8px",
              }}
            >
              clear done ✕
            </button>
          )}
        </div>

        {/* Todo list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{
              textAlign: "center",
              color: "#c9b8d8",
              fontSize: 14,
              padding: "3rem 0",
              background: "rgba(255,255,255,0.6)",
              borderRadius: 16,
              border: "1.5px dashed #e8d8f5",
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌸</div>
              {filter === "done" ? "nothing done yet, you've got this!" : "all clear! add something sweet~"}
            </div>
          )}

          {filtered.map((todo, i) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              index={i}
              editId={editId}
              editText={editText}
              setEditText={setEditText}
              onToggle={toggleDone}
              onDelete={deleteTodo}
              onEdit={startEdit}
              onSave={saveEdit}
              onCancelEdit={() => setEditId(null)}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 28, color: "#d4b8e8", fontSize: 12, letterSpacing: "1px" }}>
          ✦ ✿ you're doing amazing ✿ ✦
        </div>
      </div>
    </div>
  );
}

function TodoItem({ todo, index, editId, editText, setEditText, onToggle, onDelete, onEdit, onSave, onCancelEdit }) {
  const isEditing = editId === todo.id;
  const editRef = useRef(null);
  const c = getCat(todo.cat);

  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  return (
    <div
      className="todo-item"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: todo.done ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.82)",
        backdropFilter: "blur(8px)",
        borderRadius: 16,
        padding: "13px 16px",
        border: `1.5px solid ${todo.done ? "#f0e8f8" : c.color + "55"}`,
        transition: "all 0.2s",
        animationDelay: `${index * 0.04}s`,
        boxShadow: todo.done ? "none" : `0 2px 16px ${c.color}18`,
        opacity: todo.done ? 0.65 : 1,
      }}
    >
      {/* Category dot */}
      <div style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: c.color,
        flexShrink: 0,
        boxShadow: `0 0 0 3px ${c.color}30`,
      }} />

      {/* Checkbox */}
      <button
        className="check-btn"
        onClick={() => onToggle(todo.id)}
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          border: `2px solid ${todo.done ? c.color : "#e0d0f0"}`,
          background: todo.done ? `linear-gradient(135deg, ${c.color}, #f5a9c8)` : "#fff",
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          transition: "all 0.2s",
          boxShadow: todo.done ? `0 2px 8px ${c.color}50` : "none",
        }}
      >
        {todo.done && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Text */}
      {isEditing ? (
        <input
          ref={editRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(todo.id);
            if (e.key === "Escape") onCancelEdit();
          }}
          style={{
            flex: 1,
            background: "#fdf5ff",
            border: `1.5px solid ${c.color}`,
            borderRadius: 8,
            color: "#5a4a6a",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 500,
            padding: "5px 10px",
            outline: "none",
          }}
        />
      ) : (
        <span
          onDoubleClick={() => onEdit(todo)}
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 500,
            color: todo.done ? "#c0b0d0" : "#5a4a6a",
            textDecoration: todo.done ? "line-through" : "none",
            cursor: "text",
            lineHeight: 1.5,
          }}
          title="double-click to edit"
        >
          {todo.text}
        </span>
      )}

      {/* Actions */}
      {isEditing ? (
        <div style={{ display: "flex", gap: 6 }}>
          <MiniBtn color={c.color} onClick={() => onSave(todo.id)} label="save" />
          <MiniBtn color="#e0d0f0" textColor="#b8aac8" onClick={onCancelEdit} label="✕" />
        </div>
      ) : (
        <div className="item-actions" style={{ display: "flex", gap: 6, opacity: 0, transition: "opacity 0.15s" }}>
          <MiniBtn color={c.color} onClick={() => onEdit(todo)} label="edit" />
          <MiniBtn color="#f5a9c8" onClick={() => onDelete(todo.id)} label="✕" />
        </div>
      )}
    </div>
  );
}

function MiniBtn({ color, textColor, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: `${color}22`,
        border: `1.5px solid ${color}55`,
        color: textColor || color,
        borderRadius: 8,
        padding: "3px 10px",
        fontSize: 11,
        fontFamily: "inherit",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${color}44`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = `${color}22`)}
    >
      {label}
    </button>
  );
}
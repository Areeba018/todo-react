import React, { useState } from 'react';
import './App.css';

const initialTags = [
  { id: 1, name: 'High Priority', color: '#ff5252' },
  { id: 2, name: 'Medium Priority', color: '#ffb300' },
  { id: 3, name: 'Low Priority', color: '#4caf50' },
];
const stickyColors = ['#b2ebf2', '#fff9c4', '#ffcdd2', '#ffe0b2', '#e1bee7', '#c8e6c9'];

function App() {
  const [tags, setTags] = useState(initialTags);
  const [tasks, setTasks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newTagColor, setNewTagColor] = useState('#b2f0e6');
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editChecklist, setEditChecklist] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newChecklist, setNewChecklist] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Helper to get next color (minimize repeats)
  const getNextColor = () => {
    if (tasks.length === 0) return stickyColors[0];
    const lastColor = tasks.length > 0 ? tasks[tasks.length - 1].color : null;
    let idx = stickyColors.indexOf(lastColor);
    idx = (idx + 1) % stickyColors.length;
    return stickyColors[idx];
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: newTask,
        description: newDesc,
        color: getNextColor(),
        tag: newTaskTag || null,
        completed: false,
        checklist: newChecklist.map(item => ({ text: item, done: false })),
      },
    ]);
    setNewTask('');
    setNewDesc('');
    setNewTaskTag('');
    setNewChecklist([]);
    setShowAdd(false);
    setShowOptions(false);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const newTagObj = { id: Date.now(), name: newTag, color: newTagColor };
    setTags([...tags, newTagObj]);
    setNewTaskTag(newTagObj.id);
    setNewTag('');
    setNewTagColor('#b2f0e6');
    setShowAddTag(false);
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask({ ...selectedTask, completed: !selectedTask.completed });
    }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setEditTask(task.text);
    setEditDesc(task.description || '');
    setEditTag(task.tag || '');
    setEditChecklist(task.checklist || []);
    setNewChecklistItem('');
  };

  const handleEditTask = (e) => {
    e.preventDefault();
    setTasks(tasks.map(task =>
      task.id === selectedTask.id
        ? {
            ...task,
            text: editTask,
            description: editDesc,
            tag: editTag,
            checklist: editChecklist,
            completed: selectedTask.completed
          }
        : task
    ));
  };

  const handleChecklistToggle = (taskId, idx) => {
    setTasks(tasks.map(task => {
      if (task.id !== taskId) return task;
      const newChecklist = task.checklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item);
      if (selectedTask && selectedTask.id === taskId) setSelectedTask({ ...task, checklist: newChecklist });
      return { ...task, checklist: newChecklist };
    }));
  };

  const handleEditChecklistToggle = (idx) => {
    setEditChecklist(editChecklist.map((item, i) => i === idx ? { ...item, done: !item.done } : item));
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setNewChecklist([...newChecklist, newChecklistItem]);
    setNewChecklistItem('');
  };

  const handleEditAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setEditChecklist([...editChecklist, { text: newChecklistItem, done: false }]);
    setNewChecklistItem('');
  };

  const handleDeleteChecklistItem = (idx) => {
    setEditChecklist(editChecklist.filter((_, i) => i !== idx));
  };

  const handleDeleteTask = (id) => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = () => {
    setTasks(tasks.filter(task => task.id !== selectedTask.id));
    setSelectedTask(null);
    setShowDeleteConfirm(false);
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="sticky-app-root improved-gap">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">📝</span>
          <h2>Menu</h2>
        </div>
        <div className="sidebar-section">
          <button className="sidebar-btn primary add-task-btn cut-gradient" onClick={() => setShowAdd(true)}>
            <span className="plus-icon">＋</span> Add New Task
          </button>
        </div>
        <div className="sidebar-footer">
          <button className="sidebar-btn">Settings</button>
          <button className="sidebar-btn">Sign out</button>
        </div>
      </aside>
      <main className="sticky-wall">
        <header className="sticky-wall-header">
          <h1>Tasks</h1>
          <p className="subtitle">All your tasks as sticky notes. Click a note for details.</p>
        </header>
        <div className="sticky-notes-grid">
          {tasks.length === 0 ? (
            <div className="no-tasks-message">
              <p>No tasks yet. Click the + Add New Task button to add your first task!</p>
            </div>
          ) : (
            tasks.map((task, tIdx) => (
              <div
                key={task.id}
                className={`sticky-note${task.completed ? ' completed' : ''}`}
                style={{ background: task.color }}
                onClick={() => openTaskDetail(task)}
              >
                <button
                  className={`complete-toggle${task.completed ? ' checked' : ''}`}
                  title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  onClick={e => { e.stopPropagation(); handleToggleComplete(task.id); }}
                >
                  {task.completed ? '✔' : ''}
                </button>
                {task.tag && (
                  <div className="sticky-note-tag" style={{ background: tags.find(t => t.id === Number(task.tag))?.color }}>{tags.find(t => t.id === Number(task.tag))?.name}</div>
                )}
                <div className="sticky-note-text">{task.text}</div>
                {task.description && (
                  <div className="sticky-note-desc">{task.description}</div>
                )}
                {task.checklist && task.checklist.length > 0 && (
                  <ul className="sticky-checklist">
                    {task.checklist.map((item, idx) => (
                      <li key={idx} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => handleChecklistToggle(task.id, idx)}
                        />
                        <span className={item.done ? 'checked' : ''}>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
        {showAdd && (
          <div className="add-modal">
            <form className="add-form" onSubmit={handleAddTask}>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter task..."
                autoFocus
                required
              />
              <button type="button" className="expand-options" onClick={() => setShowOptions((v) => !v)}>
                {showOptions ? 'Hide Options' : 'More Options'}
              </button>
              {showOptions && (
                <>
                  <span className="add-tag-label">Tag:</span>
                  <select
                    value={newTaskTag}
                    onChange={(e) => setNewTaskTag(e.target.value)}
                  >
                    <option value="">No Tag</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                  </select>
                  <button type="button" className="add-inline" onClick={() => setShowAddTag(true)}>
                    + New Tag
                  </button>
                  <span className="add-tag-label">Description:</span>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Description"
                    rows={2}
                    style={{ resize: 'vertical' }}
                  />
                  <div className="checklist-section">
                    <label>Checklist:</label>
                    <div className="checklist-add-row">
                      <input
                        type="text"
                        value={newChecklistItem}
                        onChange={e => setNewChecklistItem(e.target.value)}
                        placeholder="Add checklist item"
                      />
                      <button type="button" onClick={handleAddChecklistItem}>Add</button>
                    </div>
                    <ul className="sticky-checklist">
                      {newChecklist.map((item, idx) => (
                        <li key={idx}><span>{item}</span></li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              <button type="submit">Add</button>
              <button type="button" onClick={() => { setShowAdd(false); setShowOptions(false); }}>Cancel</button>
            </form>
          </div>
        )}
        {showAddTag && (
          <div className="add-modal">
            <form className="add-form" onSubmit={handleAddTag}>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter tag name..."
                autoFocus
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                style={{ width: 40, height: 40, border: 'none', background: 'none', margin: '8px 0' }}
              />
              <button type="submit">Add Tag</button>
              <button type="button" onClick={() => setShowAddTag(false)}>Cancel</button>
            </form>
          </div>
        )}
        {selectedTask && (
          <div className="add-modal">
            <form className="add-form" onSubmit={handleEditTask}>
              <h2>Task Details</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className={`complete-toggle${selectedTask.completed ? ' checked' : ''}`}
                  title={selectedTask.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  onClick={() => handleToggleComplete(selectedTask.id)}
                  style={{ marginRight: 8 }}
                >
                  {selectedTask.completed ? '✔' : ''}
                </button>
                {selectedTask.completed ? 'Mark as incomplete' : 'Mark as complete'}
              </label>
              <input
                type="text"
                value={editTask}
                onChange={e => setEditTask(e.target.value)}
                required
              />
              <select
                className="tag-select"
                value={editTag}
                onChange={e => setEditTag(e.target.value)}
              >
                <option value="">No Tag</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
              <label className="task-desc-label" htmlFor="task-desc-area">Description:</label>
              <textarea
                id="task-desc-area"
                className="task-desc-area"
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Description"
                rows={2}
                style={{ resize: 'vertical' }}
              />
              <div className="checklist-section">
                <label>Checklist:</label>
                <div className="checklist-add-row">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    placeholder="Add checklist item"
                  />
                  <button type="button" onClick={handleEditAddChecklistItem} disabled={!newChecklistItem.trim()}>
                    Add
                  </button>
                </div>
                <ul className="sticky-checklist">
                  {editChecklist.map((item, idx) => (
                    <li key={idx}>
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => handleEditChecklistToggle(idx)}
                      />
                      <span className={item.done ? 'checked' : ''}>{item.text}</span>
                      <button type="button" onClick={() => handleDeleteChecklistItem(idx)} title="Delete item">✕</button>
                    </li>
                  ))}
                </ul>
              </div>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setSelectedTask(null)}>Close</button>
              <button type="button" className="delete-task-btn" onClick={handleDeleteTask}>
                Delete Task
              </button>
            </form>
          </div>
        )}
        {showDeleteConfirm && (
          <div className="delete-confirm-modal">
            <div className="delete-confirm-box">
              <p>Are you sure you want to delete this task?</p>
              <div className="delete-confirm-actions">
                <button className="delete-task-btn" onClick={confirmDeleteTask}>Delete</button>
                <button className="sidebar-btn" onClick={cancelDeleteTask}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

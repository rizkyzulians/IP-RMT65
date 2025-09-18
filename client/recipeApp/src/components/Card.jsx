import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverSide } from "../helpers/httpClient";

function Card({ recipe, isMyList, onDelete, onNoteUpdate, note: initialNote, noteLoading, externalId }) {
  const navigate = useNavigate();
  const [addMsg, setAddMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [editValue, setEditValue] = useState(initialNote || "");
  const [editMode, setEditMode] = useState(false);
  const [noteMsg, setNoteMsg] = useState("");

  React.useEffect(() => {
    setEditValue(initialNote || "");
  }, [initialNote]);

  const handleAddMyList = async (e) => {
    e.stopPropagation();
    if (!localStorage.getItem("access_token")) {
      setAddMsg("You must login to add to My List!");
      setTimeout(() => setAddMsg(""), 1800);
      return;
    }
    setLoading(true);
    setAddMsg("");
    try {
      await serverSide.post(
        "/mylist",
        { RecipeId: recipe.id, note: "Favorit" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      setAddMsg("Added to My List!");
    } catch (err) {
      setAddMsg(err.response?.data?.message || "Failed to add");
    } finally {
      setLoading(false);
      setTimeout(() => setAddMsg(""), 1800);
    }
  };

  return (
    <div
      className="card h-100 shadow-sm border-0 food-card d-flex flex-column align-items-stretch"
      style={{
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #f8ffec 60%, #ffe5b4 100%)',
        transition: 'transform 0.2s',
        minWidth: 0,
        maxWidth: 210,
        minHeight: 320,
        height: 320,
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      tabIndex={0}
      role="button"
      onKeyDown={e => { if (e.key === 'Enter') navigate(`/recipes/${recipe.id}`); }}
      title={recipe.title}
    >
      <div style={{
        overflow: 'hidden',
        borderTopLeftRadius: '18px',
        borderTopRightRadius: '18px',
        aspectRatio: '4/3',
        width: '100%',
        background: '#e0ffe0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <img
          src={recipe.image}
          className="card-img-top"
          alt={recipe.title}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            borderTopLeftRadius: '18px',
            borderTopRightRadius: '18px',
            boxShadow: '0 2px 8px #c8e6c9',
            aspectRatio: '4/3',
            minHeight: 0,
          }}
        />
      </div>
      <div className="card-body d-flex flex-column justify-content-between" style={{padding: '1rem 1rem 0.5rem 1rem', flex: 1, minHeight: 0}}>
        <h5
          className="card-title"
          style={{
            color: '#388e3c',
            fontWeight: 700,
            fontSize: '1.05rem',
            marginBottom: 8,
            letterSpacing: 0.5,
            minHeight: 36,
            maxHeight: 48,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {recipe.title}
        </h5>
        <p
          className="card-text"
          style={{
            color: '#ff9800',
            fontSize: '0.91rem',
            minHeight: 40,
            marginBottom: 0,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {recipe.summary}
        </p>
        {!isMyList && (
          <>
            <button
              className="btn btn-success btn-sm mt-2 align-self-end"
              style={{borderRadius: 20, fontWeight: 600, minWidth: 90, fontSize: '0.95rem'}}
              onClick={handleAddMyList}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add to My List'}
            </button>
            {addMsg && (
              <div className="mt-2 text-center" style={{fontSize: '0.92rem', color: addMsg.includes('login') ? '#d32f2f' : '#388e3c'}}>
                {addMsg}
              </div>
            )}
          </>
        )}
        {isMyList && (
          <>
              <button
              className="btn btn-danger btn-sm mt-2 align-self-end"
              style={{borderRadius: 20, fontWeight: 600, minWidth: 90, fontSize: '0.95rem'}}
              onClick={e => {
                e.stopPropagation();
                if (onDelete) onDelete(externalId ?? recipe.id);
              }}
            >
              Delete
            </button>
            <div className="mt-2" style={{width:'100%'}}>
              <label style={{fontSize:'0.93rem', color:'#388e3c', fontWeight:600}}>Note:</label>
              {editMode ? (
                    <form
                  onClick={e => e.stopPropagation()}
                  onSubmit={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onNoteUpdate) onNoteUpdate(externalId ?? recipe.id, editValue, setNoteMsg, setEditMode);
                  }}
                  style={{display:'flex', flexDirection:'column', gap:4}}
                >
                  <textarea
                    className="form-control"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    rows={2}
                    style={{fontSize:'0.95rem', resize:'vertical'}}
                    disabled={noteLoading}
                    onClick={e => e.stopPropagation()}
                  />
                  <div style={{display:'flex', gap:8, marginTop:4}}>
                    <button type="submit" className="btn btn-success btn-sm" disabled={noteLoading} style={{fontWeight:600, minWidth:60}} onClick={e => e.stopPropagation()}>
                      {noteLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={e => {e.stopPropagation(); setEditMode(false); setEditValue(initialNote||"")}} disabled={noteLoading}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{display:'flex', alignItems:'center', gap:8}} onClick={e => e.stopPropagation()}>
                  <span style={{fontSize:'0.97rem', color:'#555', flex:1, minHeight:24}}>{initialNote || <i>No note</i>}</span>
                    <button className="btn btn-outline-success btn-sm" style={{fontWeight:600, minWidth:60}} onClick={e => {e.stopPropagation(); setEditMode(true);}}>
                    Edit
                  </button>
                </div>
              )}
              {noteMsg && <div style={{fontSize:'0.92rem', color:'#388e3c', marginTop:2}}>{noteMsg}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Card;

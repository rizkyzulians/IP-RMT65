import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyList, removeFromMyList, updateNote } from '../store/slices/myListSlice';


function MyListPage() {
  const dispatch = useDispatch();
  const { items: myList = [], loading, error } = useSelector(state => state.myList || {});
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [noteLoading, setNoteLoading] = useState(null);

  useEffect(() => {
    dispatch(fetchMyList()).catch(() => {});
  }, []);

  const handleDelete = async (RecipeId) => {
    const konfirmasi = window.confirm('Apakah Anda yakin ingin menghapus resep ini dari My List?');
    if (!konfirmasi) return;
    setDeleteLoading(RecipeId);
    try {
      await dispatch(removeFromMyList(RecipeId)).unwrap();
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || JSON.stringify(err) || 'Gagal menghapus';
      alert(msg);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleNoteUpdate = async (RecipeId, note, setMsg, setEditMode) => {
    setNoteLoading(RecipeId);
    try {
      const res = await dispatch(updateNote({ recipeId: RecipeId, note })).unwrap();
      setMsg('Note updated!');
      setTimeout(() => setMsg(''), 1200);
      setEditMode(false);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || JSON.stringify(err) || 'Gagal update note';
      setMsg(msg);
    } finally {
      setNoteLoading(null);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{color:'red'}}>{error}</p>;

  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      padding: '2rem 0',
      width: '100vw',
      margin: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f8ffec 60%, #ffe5b4 100%)',
      position: 'absolute',
      left: 0,
      top: 0,
    }}>
      <div
        className="container-fluid"
        style={{
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'100%', marginBottom: '2rem'}}>
        </div>
        {myList.length === 0 ? (
          <p>No recipes saved yet.</p>
        ) : (
          <div
            className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-1 justify-content-center"
          >
            {myList.map((item) => {
              const recipeObj = item.Recipe || item.recipe || item;
              const recipeId = item.RecipeId || item.recipeId || item.id;
              return (
                <div className="col d-flex justify-content-center" key={item.id} style={{padding: 8, minWidth: 0}}>
                  <Card
                    recipe={recipeObj}
                    isMyList
                    externalId={recipeId}
                    onDelete={(id) => handleDelete(recipeId)}
                    note={item.note}
                    onNoteUpdate={handleNoteUpdate}
                    noteLoading={noteLoading === recipeId}
                  />
                  {deleteLoading === recipeId && <span style={{color:'#d32f2f', fontSize:'0.9rem'}}>Menghapus...</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyListPage;

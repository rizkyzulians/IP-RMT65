import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { serverSide } from "../helpers/httpClient";


function MyListPage() {
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null); // RecipeId yang sedang dihapus
  const [noteLoading, setNoteLoading] = useState(null); // RecipeId yang sedang update note
  const handleNoteUpdate = async (RecipeId, note, setMsg, setEditMode) => {
    setNoteLoading(RecipeId);
    try {
      const token = localStorage.getItem("access_token");
  await serverSide.patch(`/mylist/${RecipeId}`, { note }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyList(prev => prev.map(item => {
        if ((item.RecipeId || item.recipeId || item.id) === RecipeId) {
          return { ...item, note };
        }
        return item;
      }));
      setMsg('Note updated!');
      setTimeout(() => setMsg(''), 1200);
      setEditMode(false);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Gagal update note');
    } finally {
      setNoteLoading(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("You must be logged in to view your list.");
      setLoading(false);
      return;
    }
    serverSide.get("/mylist", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        let list = res.data.myList || res.data;
        if (!Array.isArray(list)) list = [];
        setMyList(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (RecipeId) => {
    const konfirmasi = window.confirm('Apakah Anda yakin ingin menghapus resep ini dari My List?');
    if (!konfirmasi) return;
    setDeleteLoading(RecipeId);
    try {
      const token = localStorage.getItem("access_token");
      await serverSide.delete(`/mylist/${RecipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyList((prev) => prev.filter(item => (item.RecipeId || item.recipeId || item.id) !== RecipeId));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus');
    } finally {
      setDeleteLoading(null);
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
          <h2 style={{fontWeight:'bold', textAlign:'center', margin:0}}>My List</h2>
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

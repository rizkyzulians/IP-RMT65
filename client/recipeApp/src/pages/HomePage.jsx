import React, { useEffect, useState, useRef } from "react";
import Card from "../components/Card";
import { serverSide } from "../helpers/httpClient";


function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true); // hanya true saat initial load
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Remove unused search state
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const inputRef = useRef();
  // AI
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  const handleAskAI = () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResult("");
    // Ambil semua resep dari server, lalu kirim ke AI
    serverSide.get('/pub/recipes/all')
      .then(res => {
        const recipeList = res.data.map(r => ({ id: r.id, title: r.title, ingredients: r.ingredients }));
        return serverSide.post('/ai/rekomendasi', { question: aiInput, recipes: recipeList });
      })
      .then(res => {
        setAiResult(res.data.rekomendasi || "Tidak ada jawaban dari AI.");
      })
      .catch(err => {
        setAiResult(err.response?.data?.message || 'Gagal mendapatkan jawaban AI');
      })
      .finally(() => setAiLoading(false));
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch recipes when page or debouncedSearch changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    let url = `/pub/recipes?page=${page}`;
    if (debouncedSearch) {
      url += `&search=${encodeURIComponent(debouncedSearch)}`;
    }
    serverSide.get(url)
      .then((res) => {
        let data = res.data.recipes || res.data;
        setRecipes(data);
        if (Array.isArray(data) && data.length === 10) {
          setTotalPage(page + 1);
        } else if (Array.isArray(data) && data.length < 10) {
          setTotalPage(page);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
        setLoading(false);
      });
    document.body.style.background = 'linear-gradient(135deg, #f8ffec 60%, #ffe5b4 100%)';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    return () => {
      cancelled = true;
      document.body.style.background = '';
      document.body.style.minHeight = '';
      document.body.style.margin = '';
    };
    // eslint-disable-next-line
  }, [debouncedSearch, page]);

  // Reset page to 1 when debouncedSearch changes, but only if not already on page 1
  useEffect(() => {
    if (page !== 1) setPage(1);
    // eslint-disable-next-line
  }, [debouncedSearch]);

  // Hilangkan loading indicator
  if (error) return <p style={{color:'red'}}>Error: {error}</p>;

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem 0',
      width: '100%',
      margin: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      background: 'none',
    }}>
      <div
        className="container-fluid"
        style={{
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Ask AI */}
        <div className="mb-3" style={{display:'flex', justifyContent:'center', alignItems:'center', gap:12, width:'100%'}}>
          <input
            type="text"
            className="form-control"
            placeholder="Tanyakan ke AI (misal: rekomendasi menu sehat)"
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            style={{maxWidth:340, fontSize:'1rem'}}
            disabled={aiLoading}
            onKeyDown={e => { if (e.key === 'Enter') handleAskAI(); }}
          />
          <button className="btn btn-warning" style={{fontWeight:600, minWidth:90}} disabled={aiLoading || !aiInput.trim()} onClick={handleAskAI}>
            {aiLoading ? 'Loading...' : 'Ask AI'}
          </button>
        </div>
        {aiResult && (
          <div className="alert alert-info text-center" style={{maxWidth:600, margin:'0 auto 1.5rem auto', whiteSpace:'pre-line'}}>
            <b>AI:</b> {aiResult}
          </div>
        )}
        {/* Search */}
        <div className="mb-4" style={{display:'flex', justifyContent:'center', alignItems:'center', gap:16, width:'100%'}}>
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder="Search recipes..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{maxWidth:320, fontSize:'1rem'}}
            autoFocus
          />
        </div>
        <div
          className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-1 justify-content-center"
        >
          {recipes.map((recipe) => (
            <div className="col d-flex justify-content-center" key={recipe.id} style={{padding: 8, minWidth: 0}}>
              <Card
                recipe={recipe}
                onDelete={async (id) => {
                  if (!window.confirm('Hapus resep ini?')) return;
                  try {
                    await serverSide.delete(`/pub/recipes/${id}`); // sesuaikan endpoint jika perlu
                    setRecipes(prev => prev.filter(r => r.id !== id));
                  } catch (err) {
                    alert(err.response?.data?.message || 'Gagal menghapus');
                  }
                }}
              />
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="d-flex justify-content-center align-items-center mt-4" style={{gap:8}}>
          <button className="btn btn-outline-success btn-sm" disabled={page <= 1} onClick={()=>setPage(page-1)}>&laquo; Prev</button>
          <span style={{fontWeight:600, minWidth:40, textAlign:'center'}}>Page {page}</span>
          <button className="btn btn-outline-success btn-sm" disabled={recipes.length < 10} onClick={()=>setPage(page+1)}>Next &raquo;</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

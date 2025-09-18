
import React, { useEffect, useState, useRef } from "react";
import Card from "../components/Card";
import { serverSide } from "../helpers/httpClient";
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchRecipes,
  fetchAllRecipesForAI,
  askAI,
  setPage as setRecipesPage,
  clearAIResult,
} from '../store/slices/recipesSlice';

function HomePage() {
  const dispatch = useDispatch();
  // Reset AI result when leaving HomePage (unmount)
  useEffect(() => {
    return () => {
      dispatch(clearAIResult());
    };
  }, [dispatch]);
  const {
    list: recipes = [],
    page = 1,
    totalPage = 1,
    loading = false,
    error = null,
    aiResult,
  } = useSelector(state => state.recipes || {});

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const inputRef = useRef();
  // AI
  const [aiInput, setAiInput] = useState("");

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
    setIsPageLoading(true);
    dispatch(fetchRecipes({ page, search: debouncedSearch }))
      .finally(() => {
        if (!cancelled) setIsPageLoading(false);
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

  // Reset page to 1 only after search fetch completes, to avoid double fetch and glitch
  useEffect(() => {
    if (debouncedSearch && page !== 1) {
      setIsPageLoading(true);
      dispatch(setRecipesPage(1));
      // fetchRecipes will be triggered by [debouncedSearch, page] effect
    }
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
            placeholder="Let me recommend you!"
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            style={{maxWidth:340, fontSize:'1rem'}}
            disabled={aiLoading}
            onKeyDown={e => { if (e.key === 'Enter') {
              if (!aiInput.trim()) return;
              setAiLoading(true);
              dispatch(fetchAllRecipesForAI()).then(action => {
                const ctx = action.payload && action.payload.rows ? action.payload.rows : action.payload;
                dispatch(askAI({ question: aiInput, recipes: ctx })).finally(() => setAiLoading(false));
              }).catch(() => setAiLoading(false));
            } }}
          />
          <button className="btn btn-warning" style={{fontWeight:600, minWidth:90}} disabled={aiLoading || !aiInput.trim()} onClick={() => {
            if (!aiInput.trim()) return;
            setAiLoading(true);
            dispatch(fetchAllRecipesForAI()).then(action => {
              const ctx = action.payload && action.payload.rows ? action.payload.rows : action.payload;
              dispatch(askAI({ question: aiInput, recipes: ctx })).finally(() => setAiLoading(false));
            }).catch(() => setAiLoading(false));
          }}>
            {aiLoading ? 'Loading...' : 'Ask me!'}
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
          {isPageLoading ? (
            <div className="text-center w-100" style={{padding: 40}}>
              <span className="spinner-border text-success" role="status" aria-hidden="true"></span>
              <span className="ms-2">Loading recipes...</span>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center w-100" style={{padding: 40}}>
              <span>No recipes found.</span>
            </div>
          ) : (
            recipes.map((recipe) => (
              <div className="col d-flex justify-content-center" key={recipe.id} style={{padding: 8, minWidth: 0}}>
                <Card
                  recipe={recipe}
                  onDelete={async (id) => {
                    if (!window.confirm('Hapus resep ini?')) return;
                    try {
                      await serverSide.delete(`/pub/recipes/${id}`); // sesuaikan endpoint jika perlu
                      setIsPageLoading(true);
                      await dispatch(fetchRecipes({ page, search: debouncedSearch }));
                    } catch (err) {
                      alert(err.response?.data?.message || 'Gagal menghapus');
                    } finally {
                      setIsPageLoading(false);
                    }
                  }}
                />
              </div>
            ))
          )}
        </div>
        {/* Pagination */}
        <div className="d-flex justify-content-center align-items-center mt-4" style={{gap:8}}>
          <button className="btn btn-outline-success btn-sm" disabled={page <= 1 || isPageLoading} onClick={()=>dispatch(setRecipesPage(page-1))}>&laquo; Prev</button>
          <span style={{fontWeight:600, minWidth:40, textAlign:'center'}}>Page {page}</span>
          <button className="btn btn-outline-success btn-sm" disabled={recipes.length < 10 || isPageLoading} onClick={()=>dispatch(setRecipesPage(page+1))}>Next &raquo;</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

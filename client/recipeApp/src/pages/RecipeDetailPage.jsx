
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { serverSide } from "../helpers/httpClient";
import CardDetail from "../components/CardDetail";

function RecipeDetailPage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    serverSide.get(`/pub/recipes/${id}`)
      .then((res) => {
        setRecipe(res.data.recipe || res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{color:'red'}}>Error: {error}</p>;
  if (!recipe) return <p>Recipe not found.</p>;

  return (
    <div style={{position:'relative', minHeight:'calc(100vh - 72px)', width:'100%', display:'grid', placeItems: 'center', padding: 0, overflowX: 'hidden'}}>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #f8ffec 60%, #ffe5b4 100%)',
        zIndex: -1,
      }} />
      <CardDetail recipe={recipe} />
    </div>
  );
}

export default RecipeDetailPage;

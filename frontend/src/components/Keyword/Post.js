import React from "react";
import Spinner from "../Loading/Spinner";
import { Typography, Box, Link, Grid, Container } from "@mui/material";

const Posts = ({ posts, loading }) => {
  if (loading) {
    return <Spinner />;
  }
  console.log(posts, 123123);
  return (
    <Box 
      sx={{
        

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography
        fontSize="28px"
        fontWeight="600"
        marginTop="20px"
        marginBottom="6px"
      >
        관련 뉴스 정보
      </Typography>
      {posts.map((post) => (
        <Link
          href={post.url}
          target="_blank"
          sx={{ textDecoration: "none", color: "black" }}
        >
          <Box
            sx={{
              width:"480px",
              display: "flex",
              
              height: "100px",
              mt: 1,
              border: "3px solid black",
              borderRadius: "10px",

              "&:hover": {
                background: "#DEE0E4",
              },
            }}
          >
            <Grid container>
              <Grid sx={{borderBottom:"1px dashed black"}}  item xs={10}>
                <Typography sx={{ pl: 1,fontSize:"18px", fontWeight:600, }}>
                  {post.title.length >= 1
                    ? post.title.replaceAll("…", " ").substr(0, 22) + "..."
                    : post.title}
                </Typography>
              </Grid>

              <Grid sx={{borderBottom:"1px dashed black"}}  item xs={2}>
                <Grid container direction="column">
                  <Grid fontSize="10px" item xs={6}>{post.press}</Grid>
                  <Grid fontSize="10px" item xs={6}>{post.time.slice(0,10).replaceAll("\u0000","")}</Grid>
                </Grid>
                
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{fontSize:"13px",pl:1}}>{post.content.length >= 100
                                  ? post.content.substr(0, 100) + "..."
                                  : post.content}</Typography>
              </Grid>
            </Grid>
          </Box>
        </Link>
      ))}
    </Box>
  );
};

export default Posts;

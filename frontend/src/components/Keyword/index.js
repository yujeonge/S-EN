import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import './style.css';

import moment from 'moment';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import './style.css';
import Spinner from '../Loading/Spinner';
import KeywordLoading from '../Loading/KeywordLoding';

import {
  getKeywords,
  getNews,
  setWordcloudData,
  getChartDetailDate,
} from '../../_actions/chart_action';
import { getPastDatalist } from '../../_actions/past_action';

import useDidMountEffect from './useDidMountEffect';

import Post from './Post';
import Paging from './Paging';

import { Grid } from '@mui/material';

function Keyword(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const chartDates = useSelector((state) => state.chartReducer.chartDates);
  const startDate = moment(chartDates.startDate).format('YYYY-MM-DD');
  const endDate = moment(chartDates.endDate).format('YYYY-MM-DD');
  const keywordList = useSelector((state) => state.chartReducer.keywords);
  const newsList = useSelector((state) => state.chartReducer.news);
  const doing = useSelector((state) => state.chartReducer.doing);

  const [showKeyword, setShowKeyword] = useState('');

  const chartDetailDate = useSelector(
    (state) => state.chartReducer.chartDetailDate,
  );

  const wordcloudData = useSelector(
    (state) => state.chartReducer.wordcloudData,
  );

  const doDetail = useSelector((state) => state.chartReducer.doDetail);

  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const [postPerPage] = useState(5);
  let indexOfLastPost = currentPage * postPerPage;
  let indexOfFirstPost = indexOfLastPost - postPerPage;
  let currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const [keywordLoading, setKeywordLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);

  // useEffect(() => {
  //   wordcloudHandler();
  // }, []);

  useEffect(() => {
    onSetKeywordNews();
  }, [doing]);

  useDidMountEffect(() => {
    onSetDetailKeywordsNews();
  }, [chartDetailDate]);

  const onSetKeywordNews = async () => {
    let keywordBody = {
      startDate: startDate,
      endDate: endDate,
    };
    d3.selectAll('svg').remove();

    setKeywordLoading(true);
    setNewsLoading(true);

    await dispatch(getKeywords(keywordBody)).then((response) => {
      const data = [];
      let sum = 0;
      console.log(response.payload);

      response.payload.map((res) => {
        var addWordcloudData = {
          text: res.keyword,
          size: res.count,
        };
        sum += res.count;
        return data.push(addWordcloudData);
      });

      setKeywordLoading(false);
      data.push(sum);
      onSetWordcloud(data);

      const maxNum = data.length - 1;
      const firstKeyword = data[maxNum].text;
      setShowKeyword(firstKeyword);
      console.log(firstKeyword);

      let newsBody = {
        keyword: firstKeyword,
        // startDate: startDate,
        // endDate: endDate,
      };

      dispatch(getNews(newsBody)).then((res) => {
        console.log(res.payload);
        setPosts(res.payload);
        setCurrentPage(1);
        indexOfLastPost = currentPage * postPerPage;
        indexOfFirstPost = indexOfLastPost - postPerPage;
        currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
      });

      setNewsLoading(false);

      // dispatch(getPastDatalist(keywordList)).then((res) => {
      //   console.log(res.payload);
      // });
    });
  };

  const onSetWordcloud = async (d) => {
    var fill = d3.scaleOrdinal(d3.schemeCategory10);
    var sum = d[10];
    var wordScale = d3
      .scaleLinear()
      .domain([0, sum])
      .range([0, 300 * 1.3]); //전체 사이즈 대비 차지하는 비율로 wordScale

    // var maxWordcloudNum = d.length - 2;
    // console.log("d", d);
    // var maxScaleNum = (parseInt(d[maxWordcloudNum].size / 100) + 2.8) * 100;
    // console.log(maxScaleNum);

    d.pop();

    var width = 669;
    var height = 400;

    cloud()
      .size([width, height])
      .words(d)
      .padding(5)
      // .rotate(0)
      .rotate(function () {
        return ~~(Math.random() * 2) * 90;
      })
      .font('MICEGothic Bold')
      .fontSize(function (d) {
        return wordScale(d.size);
      })
      .on('end', end)
      .start();

    function end(words) {
      d3.select('#word-cloud')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', function (d) {
          return d.size + 'px';
        })
        .style('font-family', 'MICEGothic Bold')
        .style('fill', function (d, i) {
          return fill(i);
        })
        .attr('text-anchor', 'middle')
        .attr('transform', function (d) {
          return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
        })
        .text(function (d) {
          return d.text;
        })
        .style('cursor', 'pointer')
        .on('click', function (d) {
          newsLoadingChange();
          onSetNews(d.target.__data__.text);
        });
      console.log(JSON.stringify(words));
    }

    const onSetNews = async (txt) => {
      setShowKeyword(txt);

      let newsBody = {
        keyword: txt,
        // startDate: startDate,
        // endDate: endDate,
      };

      await dispatch(getNews(newsBody)).then((response) => {
        console.log(response.payload);
        setPosts(response.payload);
        setCurrentPage(1);
        indexOfLastPost = currentPage * postPerPage;
        indexOfFirstPost = indexOfLastPost - postPerPage;
        currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
      });

      newsLoadingChange();
    };

    const newsLoadingChange = () => {
      setNewsLoading((current) => !current);
    };
  };

  const onSetDetailKeywordsNews = async () => {
    let keywordBody = {
      startDate: chartDetailDate.startDetailDate,
      endDate: chartDetailDate.endDetailDate,
    };

    console.log(keywordBody);

    d3.selectAll('svg').remove();

    setKeywordLoading(true);
    setNewsLoading(true);

    await dispatch(getKeywords(keywordBody)).then((response) => {
      const data = [];
      let sum = 0;
      console.log(response.payload);

      response.payload.map((res) => {
        var addWordcloudData = {
          text: res.keyword,
          size: res.count,
        };
        sum += res.count;
        return data.push(addWordcloudData);
      });

      setKeywordLoading(false);
      data.push(sum);
      onSetWordcloud(data);

      const maxNum = data.length - 1;
      const firstKeyword = data[maxNum].text;
      setShowKeyword(firstKeyword);

      console.log(firstKeyword);

      let newsBody = {
        keyword: firstKeyword,
        // startDate: startDate,
        // endDate: endDate,
      };

      dispatch(getNews(newsBody)).then((res) => {
        console.log(res.payload);
        setPosts(res.payload);
        setCurrentPage(1);
        indexOfLastPost = currentPage * postPerPage;
        indexOfFirstPost = indexOfLastPost - postPerPage;
        currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
      });

      setNewsLoading(false);

      // dispatch(getPastDatalist(keywordList)).then((res) => {
      //   console.log(res.payload);
      // });
    });
  };

  const pastSearchClickHandler = () => {
    navigate('/pastsearch');
  };

  return (
    <div className="keyword_box">
      <Grid container spacing={2} justifyContent="space-between">
        <p className="keyword_title keyword_title-grey" id="font_test">
          <span>
            {`${moment(chartDetailDate.startDetailDate).format(
              'YYYY.MM.DD',
            )} ~ ${moment(chartDetailDate.endDetailDate).format('YYYY.MM.DD')}`}
          </span>
          <span className="keyword_title-smaller"> 의 분석 결과</span>
        </p>
        <button
          id="font_test"
          className="custom-btn btn-3"
          onClick={pastSearchClickHandler}
        >
          <span>과거 키워드 검색</span>
        </button>

        <Grid item xs={12}>
          {keywordLoading ? <KeywordLoading /> : null}
          <div id="word-cloud"></div>
          {/* <button onClick={pastSearchClickHandler}>과거</button> */}
        </Grid>

        <Grid item xs={12}>
          {/* {keywordLoading ? null : <h1>{`${showKeyword}`}</h1>} */}

          <div className="newscontainer">
            <Post
              posts={currentPosts}
              loading={newsLoading}
              showKeyword={showKeyword}
            />
            <Paging
              totalCount={posts.length}
              postPerPage={postPerPage}
              postRangeDisplayed={5}
              handlePageChange={handlePageChange}
              page={currentPage}
              loading={newsLoading}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default Keyword;

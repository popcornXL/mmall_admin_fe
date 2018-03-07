'use strict';
import React        from 'react';
import ReactDOM     from 'react-dom';
import { Link }     from 'react-router';

import PageTitle    from 'component/page-title/index.jsx';
import Pagination   from 'component/pagination/index.jsx';

import MMUtile      from 'util/mm.jsx';
import Product      from 'service/product.jsx';

const _mm = new MMUtile();
const _product = new Product();

import './index.scss';

const ProductList = React.createClass({
    getInitialState() {
        return {
            list            : [],
            listType        : 'list', // list / search
            searchType      : 'productId', // productId / productName
            searchKeyword   : '',
            pageNum         : 1
        };
    },
    componentDidMount(){
       this.loadProductList();
    },
    // 加載產品列表
    loadProductList(pageNum){
        let listParam       = {},
            listType        = this.state.listType,
            searchType      = this.state.searchType;
            
        listParam.listType  = listType;
        listParam.pageNum   = pageNum || this.state.pageNum;
        // 按商品名搜索
        if(listType == 'search' && searchType == "productName"){
            listParam.productName = this.state.searchKeyword;
        }
        // 按商品id搜索
        if(listType == 'search' && searchType == "productId"){
            listParam.productId = this.state.searchKeyword;
        }
        // 查詢
        _product.getProductList(listParam).then(res => {
            console.log(res)
            this.setState(res);
        }, err => {
            _mm.errorTips(err.msg || err.statusText);
        });
    },
    // 搜索類型變化
    onSearchTypeChange(e){
        let searchType = e.target.value;
        this.setState({
            searchType : searchType
        });
    },
    // 關鍵詞變化
    onKeywordChange(e){
        let keyword = e.target.value;
        this.setState({
            searchKeyword : keyword
        });
    },
    // 搜索
    onSearch(){
        this.setState({
            listType    : 'search'
        }, () => {
            this.loadProductList(1);
        });
    },
    // 頁數變化
    onPageNumChange(pageNum){
        this.loadProductList(pageNum);
    },
    setProductStatus(productId, status){
        let currentStatus   = status,
            newStatus       = currentStatus == 1 ? 2 : 1,
            statusChangeTips= currentStatus == 1 ? '確定要下架該商品？' : '確定要上架該商品？';
        if(window.confirm(statusChangeTips)){
            _product.setProductStatus(productId, newStatus).then(res => {
                // 操作成功提示
                _mm.successTips(res);
                this.loadProductList();
            }, err => {
                _mm.errorTips(err.msg);
            });
        }
    },
    render() {
        
        return (
            <div id="page-wrapper">
                <PageTitle pageTitle="商品管理">
                    <div className="page-header-right">
                        <Link className="btn btn-primary" to="/product/save"><i className="fa fa-plus fa-fw"></i>添加商品</Link>
                    </div>
                </PageTitle>
                <div className="row">
                    <div className="search-wrap col-md-12">
                        <div className="form-inline">
                            <div className="form-group">
                                <select className="form-control" onChange={this.onSearchTypeChange}>
                                    <option value="productId">按商品id查詢</option>
                                    <option value="productName">按商品名稱查詢</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <input type="text" className="form-control" placeholder="關鍵詞" onChange={this.onKeywordChange}/>
                            </div>
                            <button type="button" className="btn btn-default" onClick={this.onSearch}>查詢</button>
                        </div>
                    </div>
                    <div className="table-wrap col-lg-12">
                        <table className="table table-striped table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th>id</th>
                                    <th>信息</th>
                                    <th>價格</th>
                                    <th>狀態</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.list.length ? this.state.list.map((product, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{product.id}</td>
                                                <td>
                                                    <p>{product.name}</p>
                                                    <p>{product.subtitle}</p>
                                                </td>
                                                <td>{product.price}</td>
                                                <td>
                                                    <span>{product.status == 1 ? '在售' : '已下架'}</span>
                                                    <a className="btn btn-xs btn-warning opear" 
                                                        data-status={product.status} 
                                                        onClick={this.setProductStatus.bind(this, product.id, product.status)}>{product.status == 1 ? '下架' : '上架'}</a>
                                                </td>
                                                <td>
                                                    <Link className="opear" to={ '/product/detail/' + product.id}>查看</Link>
                                                    <Link className="opear"  to={ '/product/save/' + product.id}>編輯</Link>
                                                </td>
                                            </tr>
                                        );
                                    }) :
                                    (
                                        <tr>
                                            <td colSpan="5" className="text-center">暫無結果~</td>
                                        </tr>
                                    )
                                }
                                            
                            </tbody>
                        </table>
                    </div>
                    {
                    this.state.pages > 1 ? <Pagination onChange={this.onPageNumChange} 
                        current={this.state.pageNum} 
                        total={this.state.total} 
                        showLessItems/>: null
                    }
                </div>
            </div>
        );
    }
});

export default ProductList;
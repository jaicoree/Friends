import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Axios from 'axios';
import { MenuItem, Grid, Paper, Fade } from '@material-ui/core';

import { getMainUsers,
		clearMainUsers,
		getMainGroups,
		clearMainGroups
	} from 'actions';
import { Select,
		RadioGroup,
		TextField,
		Button,
		CancelButton,
		Slider,
		ExpansionPanel,
		Dialog,
	} from 'components';
import { FilterIcon,
		NanoStarIcon,
		NanoMapIcon,
		NanoGenderIcon,
		NanoAgeIcon,
		NanoSearchIcon,
	} from 'components/AppBarIcons';
import { BlueChip } from 'components/Chips';

class Filter extends Component {
	state = {
		filter: {
			interest: "",
			si: "",
			gu: "",
			gender: "0",
			minAge: 0,
			maxAge: 100,
			keyword: "",
		},
		keywordError: false,
		searchDisabled: false,
		filtering: false,		// 현재 필터검색이 적용중이면 true
		optionFader: false, 	/// 필터 목록창의 fade 효과를 주기 위한 변수
		filterExpanded: false,
		dialogOpen: false,
		dialogIcon: 0,
		dialogTitle: "",
		dialogContent: "",
	}
	t_checkKeyword = null;
	t_cancelFilter = null;

	componentDidMount() {
		// TODO: 추천 유저, 그룹 데이터를 읽어오도록 함
	}
	expandFilter = () => {
		this.setState(state => ({filterExpanded: !state.filterExpanded, optionFader: false}));
	}
	handleChange = ({target}) => {
		const {id, name, value} = target;
		if(id === "search") {
			clearTimeout(this.t_checkKeyword);
			this.setState(state => ({filter: {...state.filter, keyword: value}, keywordError: false, searchDisabled: false}));
			if(/[^0-9가-힣a-zA-Z\s]/.test(value)) {		// 특수문자 검색불가
				this.setState({searchDisabled: true});
				this.t_checkKeyword = setTimeout(() => {
					return this.setState(state => ({filter: {...state.filter, keyword: value}, keywordError: true}));
				}, 500);
			}
		} else {
			switch(name){
				case "si":
				return this.setState(state => ({filter: {...state.filter, si: value, gu: ""}}));
				default:
				return this.setState(state => ({filter: {...state.filter, [name]: value}}));
			}
		}
	}
	handleSlider = (values, e) => {
		this.setState(state => ({filter: {...state.filter, minAge: parseInt(values[0], 10), maxAge: parseInt(values[1], 10)}}));
	}
	handleFilter = () => {
		this.setState({filterExpanded: false});

		this.props.clearMainGroups();
		this.props.clearMainUsers();
		const { interest, si, gu, gender, minAge, maxAge, keyword } = this.state.filter;
		Axios.get(`http://192.168.0.200:8080/${this.props.path}`, {
			params: { token: this.props.token, filter: true, page: 1,
					interest, si, gu, gender, minAge, maxAge, keyword }
		})
		.then(resp => {
			if(interest || si || gu || gender!=="0" || minAge || maxAge!==100 || keyword)
			this.setState({optionFader: true, filtering: true});
			switch(this.props.path) {
				case "users":
				this.props.getMainUsers(resp.data.users)
					break;
					case "groups":
					this.props.getMainGroups(resp.data.groups)
					break;
				default:
			}
		}).catch(err => {
			console.log(err);
			let errorTitle, errorMessage;
			// if(!err.response || !err.response.data) {
				errorTitle = "서버와 연결할 수 없습니다";
				errorMessage = "잠시후 다시 시도해 주세요...";
			// }
			// else {
			// 	errorTitle = err.response.data;
			// }
			this.setState({
				dialogOpen: true,
				dialogIcon: 2,
				dialogTitle: errorTitle,
				dialogContent: errorMessage
			});
		})
	}
	handleDelete = target => {
		let filter = {...this.state.filter};
		switch(target){
			case "interest":
				this.setState(state => ({filter: {...state.filter, interest: ""}}));
				filter = {...filter, interest: ""};
				break;
			case "sigu":
				this.setState(state => ({filter: {...state.filter, si: "", gu: ""}}));
				filter = {...filter, si: "", gu: ""};
				break;
			case "gender":
				this.setState(state => ({filter: {...state.filter, gender: "0"}}));
				filter = {...filter, gender: "0"};
				break;
			case "age":
				this.setState(state => ({filter: {...state.filter, minAge: 0, maxAge: 100}}));
				filter = {...filter, minAge: 0, maxAge: 100};
				break;
			case "keyword":
				this.setState(state => ({filter: {...state.filter, keyword: ""}}));
				filter = {...filter, keyword: ""};
				break;
			default:
		}

		this.props.clearMainGroups();
		this.props.clearMainUsers();

		const { interest, si, gu, gender, minAge, maxAge, keyword } = filter;
		Axios.get(`http://192.168.0.200:8080/${this.props.path}`, {
			params: { token: this.props.token, filter: true, page: 1,
					interest, si, gu, gender, minAge, maxAge, keyword }
		})
		.then(resp => {
			if(interest || si || gu || gender!=="0" || minAge || maxAge!==100 || keyword)
			this.setState({optionFader: true, filtering: true});
			switch(this.props.path) {
				case "users":
				this.props.getMainUsers(resp.data.users)
					break;
					case "groups":
					this.props.getMainGroups(resp.data.groups)
					break;
				default:
			}
			console.log(`${this.props.path} 검색결과 . .. .`, resp.data);
		}).catch(err => {
			console.log(err);
			let errorTitle, errorMessage;
			// if(!err.response || !err.response.data) {
				errorTitle = "서버와 연결할 수 없습니다";
				errorMessage = "잠시후 다시 시도해 주세요...";
			// }
			// else {
			// 	errorTitle = err.response.data;
			// }
			this.setState({
				dialogOpen: true,
				dialogIcon: 2,
				dialogTitle: errorTitle,
				dialogContent: errorMessage
			});
		})

		setTimeout(() => {
			const { interest, si, gu, gender, minAge, maxAge, keyword } = this.state.filter;
			if(!interest && !si && !gu && gender==="0" && !minAge && maxAge===100 && !keyword)
				this.setState({optionFader: false});
		}, 100);
	}
	handleCancel = () => {
		this.setState({optionFader: false});
		clearTimeout(this.t_cancelFilter);
		this.t_cancelFilter = setTimeout(() => {
			this.setState({filtering: false,
				filter: {
					interest: "",
					si: "",
					gu: "",
					gender: "0",
					minAge: 0,
					maxAge: 100,
					keyword: ""
			}});

			this.props.clearMainGroups();
			this.props.clearMainUsers();


			console.log("REQEQEQRQRRQRQRQRQ", `http://192.168.0.200:8080/${this.props.path}`, this.props.token )

			Axios.get(`http://192.168.0.200:8080/${this.props.path}`, {
				params: { token: this.props.token, page: 1 }
			})
			.then(resp => {
				switch(this.props.path) {
					case "users":
						this.props.getMainUsers(resp.data.users)
						break;
					case "groups":
						this.props.getMainGroups(resp.data.groups)
						break;
					default:
				}
				console.log(`${this.props.path} 검색결과 . .. .`, resp.data);
			}).catch(err => {
				console.log(err);
				let errorTitle, errorMessage;
				// if(!err.response || !err.response.data) {
					errorTitle = "서버와 연결할 수 없습니다";
					errorMessage = "잠시후 다시 시도해 주세요...";
				// }
				// else {
					// errorTitle = err.response.data;
				// }
				this.setState({
					dialogOpen: true,
					dialogIcon: 2,
					dialogTitle: errorTitle,
					dialogContent: errorMessage
				});
			})
		}, 100);
		// TODO: 필터를 취소했으므로 기본 추천 유저들 재호출
	}
	handleDialogClose = () => {
		this.setState({ dialogOpen: false,
			dialogIcon: 0,
			dialogTitle:"",
			dialogContent:"" });
	};
	render() {
		const { dataInterest, dataSi, dataGu, token, children } = this.props;
		const { interest, si, gu, gender, minAge, maxAge, keyword } = this.state.filter;
		const { keywordError, searchDisabled, filterExpanded, filtering, optionFader,
				dialogOpen, dialogIcon, dialogTitle, dialogContent } = this.state;
		return (
			<div style={{position:"absolute", top:"10px"}}>
				<ExpansionPanel
					onClick={this.expandFilter}
					expanded={filterExpanded}
					summary="필터"
					icon={<FilterIcon/>}
					>
					<Grid container
						direction="row"
						justify="center"
						alignItems="flex-start"
						spacing={16}>
						<Grid item>
							<Select
								name="interest"
								value={interest}
								label="관심사"
								displayEmpty
								emptyLabel="전체"
								width="200px"
								MenuProps={{
									PaperProps: {
									style: {
									maxHeight: "500px",
									margin: "0 195px",
									}}
								}}
								handleChange={this.handleChange}>
								{_.map(dataInterest, interest => <MenuItem value={interest.code} key={interest.code}>{interest.name}</MenuItem>)}
							</Select>
						</Grid>
						<Grid item>
							<Select
								name="si"
								value={si}
								label="지역(시)"
								displayEmpty
								emptyLabel="전체"
								width="200px"
								MenuProps={{
									PaperProps: {
									style: {
									maxHeight: "500px",
									margin: "0 195px",
									}}
								}}
								handleChange={this.handleChange}>
								{_.map(dataSi, si => <MenuItem value={si.code} key={si.code}>{si.name}</MenuItem>)}
							</Select>
						</Grid>
						<Grid item>
							<Select
								name="gu"
								value={gu}
								label="지역(구)"
								displayEmpty
								emptyLabel="전체"
								width="200px"
								MenuProps={{
									PaperProps: {
									style: {
									maxHeight: "500px",
									margin: "0 195px",
									}}
								}}
								handleChange={this.handleChange}>
								{_.map(dataGu[si], gu => <MenuItem value={gu.gucode} key={gu.gucode}>{gu.name}</MenuItem>)}
							</Select>
						</Grid>
						<Grid item>
							<RadioGroup
								name="gender"
								value={gender}
								label="성별"
								row
								handleChange={this.handleChange}
								data={[{label: "전체", value: "0"}, {label: "남성", value: "1"}, {label: "여성", value: "2"}]}/>
						</Grid>
						<Grid item>
							<Slider
								minAge={minAge}
								maxAge={maxAge}
								label="연령"
								handleSlider={this.handleSlider}
								/>
						</Grid>
						<Grid item>
							<TextField
								id="search"
								value={keyword}
								onChange={this.handleChange}
								label={children}
								error={keywordError}
								errorMessage="잘못된 입력입니다"
								placeholder="전체"
								shrink
								width="200px"
								margin="dense"/>
						</Grid>
						<Grid item>
							<Button
								disabled={searchDisabled}
								onClick={this.handleFilter}>
								적용하기
							</Button>
						</Grid>
					</Grid>
					<Dialog
						open={dialogOpen}
						onClose={this.handleDialogClose}
						title={dialogTitle}
						content={dialogContent}
						disableBackdrop={true}
						icon={dialogIcon}
					/>
				</ExpansionPanel>
				{
					filtering && <Fade in={optionFader}>
						<Paper style={{
							verticalAlign: "top",
							height: "48px",
							display: "inline-block",
							margin: "0 10px",
							padding: "7px"}}>
							{
								interest && <BlueChip
										avatar={<NanoStarIcon padding="0 15px"/>}
										label={dataInterest[interest].name}
										onDelete={()=>{this.handleDelete("interest")}}
										/>
							}{
								(si || gu) && <BlueChip
										avatar={<NanoMapIcon padding="0 15px"/>}
										label={`${dataSi[si].name} ${ gu && dataGu[si][gu].name }`}
										onDelete={()=>{this.handleDelete("sigu")}}
										/>
							}{
								gender !== "0" && <BlueChip
											avatar={<NanoGenderIcon padding="0 15px"/>}
											label={gender === "1" ? "남성" : "여성"}
											onDelete={()=>{this.handleDelete("gender")}}
											/>
							}{
								(minAge!==0 || maxAge!==100) && <BlueChip
										avatar={<NanoAgeIcon padding="0 15px"/>}
										label={`${minAge}-${maxAge}`}
										onDelete={()=>{this.handleDelete("age")}}
										/>
							}{
								keyword && <BlueChip
										avatar={<NanoSearchIcon padding="0 15px"/>}
										label={keyword}
										onDelete={()=>{this.handleDelete("keyword")}}
										/>
							}
							<CancelButton onClick={this.handleCancel}/>
						</Paper>
					</Fade>
				}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	dataInterest: state.dataInterest,
	dataSi: state.dataSi,
	dataGu: state.dataGu,
	token: state.token,
})
const mapDispatchToProps = {
	getMainUsers,
	clearMainUsers,
	getMainGroups,
	clearMainGroups
}

export default connect(mapStateToProps, mapDispatchToProps)(Filter);

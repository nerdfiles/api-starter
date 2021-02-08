/*****************************************
// bigco, inc company
// representation templates
// 2020-11-26 : nerdfiles
 *****************************************/

var pForms  = React.Component {
  constructor () {
    this.state = {
    }
  }
  componentDidUpdate () {
  }
  componentDidMount () {}
  validate ($event) {
    console.log({ $event })
  }
  render () {
    return (
      <form
        className=""
        onSubmit={e => this.validate(e)}
      >
      {
        Array.from([]).forEach(function (itemRef) {
          return (
            <li></li>
          )
        })
      }
        <Input 
          id="category"
          name="category"
          type="text"
          onChange={e => this.setState({
            category: e.target.value
          })}
        />
      </form>
    )
  }
}

const mapStateToProps = state => ({ 
  auth: state.auth,
  metadata: state.metadata
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(pForms);

exports.template = pForms

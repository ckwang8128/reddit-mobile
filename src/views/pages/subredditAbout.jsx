import React from 'react';
import q from 'q';
import constants from '../../constants';

import LoadingFactory from '../components/Loading';
var Loading;

import TrackingPixelFactory from '../components/TrackingPixel';
var TrackingPixel;

import TopSubnavFactory from '../components/TopSubnav';
var TopSubnav;

class SubredditAboutPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data || {}
    };

    this.state.loaded = !!this.state.data.data;
  }

  componentDidMount() {
    SubredditAboutPage.populateData(this.props.api, this.props, true).done((function (data) {
      this.setState({
        data: data,
        loaded: true
      });
    }).bind(this));

    this.props.app.emit(constants.TOP_NAV_SUBREDDIT_CHANGE, `r/${this.props.subredditName}/about`);
  }

  componentDidUpdate() {
    this.props.app.emit('page:update', this.props);
  }

  render() {
    var loading;
    var tracking;

    if (!this.state.loaded) {
      loading = (
        <Loading />
      );
    }

    var app = this.props.app;
    var user = this.props.user;

    if (this.state.data.meta && this.props.renderTracking) {
      tracking = (
        <TrackingPixel
          url={ this.state.data.meta.tracking }
          user={ this.props.user }
          loid={ this.props.loid }
          loidcreated={ this.props.loidcreated }
          compact={ this.props.compact }
        />);
    }

    var htmlDump;
    if (!loading) {
      var data = this.state.data.data;
      htmlDump = [
        <ul className='subreddit-about-numbers' key='subreddit-about-numbers'>
          <li>{ `${data.subscribers} readers` }</li>
          <li>{ `${data.accounts_active} users here now` }</li>
        </ul>,
        <div className='subreddit-about-rules' key='subreddit-about-rules'
          dangerouslySetInnerHTML={{ __html: data.description_html }}>
        </div>
      ];
    }

    return (
      <div className='subreddit-about-main'>
        { loading }

        <TopSubnav
          app={ app }
          random={ this.props.random }
          user={ user }
          hideSort={ true }
          baseUrl={ this.props.url }
          loginPath={ this.props.loginPath } />

        <div className='container' key='container'>
          { htmlDump }
        </div>

        { tracking }
      </div>
    );
  }

  static populateData(api, props, synchronous, useCache = true) {
    var defer = q.defer();

    // Only used for server-side rendering. Client-side, call when
    // componentedMounted instead.
    if (!synchronous) {
      defer.resolve(props.data);
      return defer.promise;
    }

    var options = api.buildOptions(props.apiOptions);
    options.query.subreddit = props.subredditName;
    options.useCache = useCache;

    // Initialized with data already.
    if (useCache && (props.data || {}).data) {
      api.hydrate('subreddits', options, props.data);

      defer.resolve(props.data);
      return defer.promise;
    }

    api.subreddits.get(options).done(function (data) {
      defer.resolve(data);
    });

    return defer.promise;
  }
}

function SubredditAboutPageFactory(app) {
  Loading = LoadingFactory(app);
  TrackingPixel = TrackingPixelFactory(app);
  TopSubnav = TopSubnavFactory(app);

  return app.mutate('core/pages/listing/about', SubredditAboutPage);
}

export default SubredditAboutPageFactory;


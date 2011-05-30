require 'faye'


require File.dirname(__FILE__) + '/main'


Sinatra::Base.set(:run, false)
Sinatra::Base.set(:env, ENV['RACK_ENV'])
use Faye::RackAdapter, :mount => '/faye', :timeout => 45

run Sinatra::Application

# frozen_string_literal: true

require 'rack'
require 'rackup'
require 'json'
require 'webrick'

class GraphQLServer
  def self.run(schema, options = {})
    Rackup::Handler::WEBrick.run(GraphQLServer.new(schema), **options)
  end

  attr_reader :schema

  def initialize(schema)
    @schema = schema
  end

  def call(env)
    req = Rack::Request.new(env)
    body = req.body.read
    req_vars = body.empty? ? {} : JSON.parse(body)
    result = schema.execute(
      req_vars['query'],
      operation_name: req_vars['operationName'],
      variables: req_vars['variables'] || {},
    )
    [200, { 'content-type' => 'application/json' }, [JSON.dump(result.to_h)]]
  end
end

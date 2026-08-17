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

    begin
      req_vars = body.empty? ? {} : JSON.parse(body)
    rescue JSON::ParserError
      return error_response(400, 'Request body must be valid JSON')
    end

    query = req_vars['query']
    unless query.is_a?(String) && !query.strip.empty?
      return error_response(400, 'GraphQL query is required')
    end

    result = schema.execute(
      query,
      operation_name: req_vars['operationName'],
      variables: req_vars['variables'] || {},
    )
    [200, { 'content-type' => 'application/json' }, [JSON.dump(result.to_h)]]
  end

  private

  def error_response(status, message)
    [status, { 'content-type' => 'application/json' }, [JSON.dump({ errors: [{ message: message }] })]]
  end
end

# frozen_string_literal: true

require 'graphql'

# Stitching directive definitions (native GraphQL-Ruby schema directives)

class MergeDirective < GraphQL::Schema::Directive
  graphql_name 'merge'
  argument :keyField, String, required: false
  argument :keyArg, String, required: false
  argument :additionalArgs, String, required: false
  argument :key, [String], required: false
  argument :argsExpr, String, required: false
  locations FIELD_DEFINITION
end

class KeyDirective < GraphQL::Schema::Directive
  graphql_name 'key'
  argument :selectionSet, String, required: true
  locations OBJECT
end

class ComputedDirective < GraphQL::Schema::Directive
  graphql_name 'computed'
  argument :selectionSet, String, required: true
  locations FIELD_DEFINITION
end

class BaseObject < GraphQL::Schema::Object
end

class BaseSchema < GraphQL::Schema
  directive(MergeDirective)
  directive(KeyDirective)
  directive(ComputedDirective)
end

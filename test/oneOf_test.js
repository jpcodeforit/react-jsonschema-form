import React from "react";
import { expect } from "chai";
import { Simulate } from "react-addons-test-utils";

import { createFormComponent, createSandbox, setProps } from "./test_utils";

describe("oneOf", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should not render a select element if the oneOf keyword is not present", () => {
    const schema = {
      type: "object",
      properties: {
        foo: { type: "string" },
      },
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll("select")).to.have.length.of(0);
  });

  it("should render a select element if the oneOf keyword is present", () => {
    const schema = {
      type: "object",
      oneOf: [
        {
          properties: {
            foo: { type: "string" },
          },
        },
        {
          properties: {
            bar: { type: "string" },
          },
        },
      ],
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll("select")).to.have.length.of(1);
  });

  it("should change the rendered form when the select value is changed", () => {
    const schema = {
      type: "object",
      oneOf: [
        {
          properties: {
            foo: { type: "string" },
          },
        },
        {
          properties: {
            bar: { type: "string" },
          },
        },
      ],
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll("#root_foo")).to.have.length.of(1);
    expect(node.querySelectorAll("#root_bar")).to.have.length.of(0);

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect(node.querySelectorAll("#root_foo")).to.have.length.of(0);
    expect(node.querySelectorAll("#root_bar")).to.have.length.of(1);
  });

  it("should handle change events", () => {
    const schema = {
      type: "object",
      oneOf: [
        {
          properties: {
            foo: { type: "string" },
          },
        },
        {
          properties: {
            bar: { type: "string" },
          },
        },
      ],
    };

    const { comp, node } = createFormComponent({
      schema,
    });

    Simulate.change(node.querySelector("input#root_foo"), {
      target: { value: "Lorem ipsum dolor sit amet" },
    });

    expect(comp.state.formData.foo).eql("Lorem ipsum dolor sit amet");
  });

  it("should clear previous data when changing options", () => {
    const schema = {
      type: "object",
      properties: {
        buzz: { type: "string" },
      },
      oneOf: [
        {
          properties: {
            foo: { type: "string" },
          },
        },
        {
          properties: {
            bar: { type: "string" },
          },
        },
      ],
    };

    const { comp, node } = createFormComponent({
      schema,
    });

    Simulate.change(node.querySelector("input#root_buzz"), {
      target: { value: "Lorem ipsum dolor sit amet" },
    });

    Simulate.change(node.querySelector("input#root_foo"), {
      target: { value: "Consectetur adipiscing elit" },
    });

    expect(comp.state.formData.buzz).eql("Lorem ipsum dolor sit amet");
    expect(comp.state.formData.foo).eql("Consectetur adipiscing elit");

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect(comp.state.formData.hasOwnProperty("foo")).to.be.false;
    expect(comp.state.formData.buzz).eql("Lorem ipsum dolor sit amet");
  });

  it("should support options with different types", () => {
    const schema = {
      type: "object",
      properties: {
        userId: {
          oneOf: [
            {
              type: "number",
            },
            {
              type: "string",
            },
          ],
        },
      },
    };

    const { comp, node } = createFormComponent({
      schema,
    });

    Simulate.change(node.querySelector("input#root_userId"), {
      target: { value: 12345 },
    });

    expect(comp.state.formData).eql({
      userId: 12345,
    });

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect(comp.state.formData).eql({
      userId: undefined,
    });

    Simulate.change(node.querySelector("input#root_userId"), {
      target: { value: "Lorem ipsum dolor sit amet" },
    });

    expect(comp.state.formData).eql({
      userId: "Lorem ipsum dolor sit amet",
    });
  });

  it("should support custom fields", () => {
    const schema = {
      type: "object",
      properties: {
        userId: {
          oneOf: [
            {
              type: "number",
            },
            {
              type: "string",
            },
          ],
        },
      },
    };

    const CustomField = () => {
      return <div id="custom-oneof-field" />;
    };

    const { node } = createFormComponent({
      schema,
      fields: {
        OneOfField: CustomField,
      },
    });

    expect(node.querySelectorAll("#custom-oneof-field")).to.have.length(1);
  });

  it("should select the correct field when the form is rendered from existing data", () => {
    const schema = {
      type: "object",
      properties: {
        userId: {
          oneOf: [
            {
              type: "number",
            },
            {
              type: "string",
            },
          ],
        },
      },
    };

    const { node } = createFormComponent({
      schema,
      formData: {
        userId: "foobarbaz",
      },
    });

    expect(node.querySelector("select").value).eql("1");
  });

  it("should select the correct field when the formData property is updated", () => {
    const schema = {
      type: "object",
      properties: {
        userId: {
          oneOf: [
            {
              type: "number",
            },
            {
              type: "string",
            },
          ],
        },
      },
    };

    const { comp, node } = createFormComponent({
      schema,
    });

    expect(node.querySelector("select").value).eql("0");

    setProps(comp, {
      schema,
      formData: {
        userId: "foobarbaz",
      },
    });

    expect(node.querySelector("select").value).eql("1");
  });
});

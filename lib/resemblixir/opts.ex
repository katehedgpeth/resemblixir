defmodule Resemblixir.Opts do
  @type t :: %__MODULE__{
    raise_on_error?: boolean,
    async: boolean,
    parent: pid
  }
  defstruct [:parent, async: false, raise_on_error?: true]
end

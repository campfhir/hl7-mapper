export type Node = {
  [node: string]: string | Node;
};

export type Message = {
  msg: Node;
  raw: string;
};
